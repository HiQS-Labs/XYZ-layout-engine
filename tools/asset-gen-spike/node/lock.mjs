// Node 22 OS Lockfile adapter with fail-closed registration and zero automatic unlinking
import fs from 'node:fs';

export function isPidAlive(pid) {
  if (!pid || typeof pid !== 'number' || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

export function readLockInfo(lockPath) {
  try {
    const text = fs.readFileSync(lockPath, 'utf8');
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function checkLiveness(lockPath) {
  const info = readLockInfo(lockPath);
  if (!info || typeof info !== 'object') {
    // Incomplete, unparseable or ambiguous record -> fail-closed
    return { isHeld: true, reason: 'incomplete or ambiguous lock record' };
  }
  const parentAlive = isPidAlive(info.parentPid);
  const childAlive = Array.isArray(info.childPids) && info.childPids.some(isPidAlive);
  if (parentAlive || childAlive) {
    return { isHeld: true, reason: parentAlive ? 'parent process alive' : 'child caller alive' };
  }
  // Even if dead, per Plan QA and tools/catalog.mjs:492, stale locks require operator inspection
  // and are never stolen or unlinked automatically by competing runners.
  return { isHeld: true, isStale: true, reason: 'dead owner requires explicit reconciliation' };
}

export function acquireLock(lockPath) {
  let fd;
  try {
    fd = fs.openSync(lockPath, 'wx');
  } catch (err) {
    if (err.code === 'EEXIST') {
      return null;
    }
    throw err;
  }

  const record = {
    parentPid: process.pid,
    childPids: [],
    inFlightAttempts: [],
    timestamp: Date.now()
  };
  fs.writeFileSync(fd, JSON.stringify(record, null, 2));
  fs.fsyncSync(fd);

  return {
    lockPath,
    fd,
    record,
    registerAttempt(attemptId) {
      if (!record.inFlightAttempts.includes(attemptId)) {
        record.inFlightAttempts.push(attemptId);
        this._flush();
      }
    },
    registerChild(childPid) {
      if (childPid && !record.childPids.includes(childPid)) {
        record.childPids.push(childPid);
        this._flush();
      }
    },
    _flush() {
      try {
        fs.ftruncateSync(fd, 0);
        fs.writeSync(fd, JSON.stringify(record, null, 2), 0, 'utf8');
        fs.fsyncSync(fd);
      } catch {
        // ignore flush error if closing
      }
    },
    release() {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
      try {
        if (record.parentPid === process.pid && fs.existsSync(lockPath)) {
          fs.unlinkSync(lockPath);
        }
      } catch {
        // ignore
      }
    }
  };
}
