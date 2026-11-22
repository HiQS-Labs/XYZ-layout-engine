// Node 22 OS Lockfile adapter with fail-closed registration and zero automatic unlinking
import fs from 'node:fs';

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
