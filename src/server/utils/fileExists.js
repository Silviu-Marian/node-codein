import fs from 'fs';

export default function fileExists(f) {
  try {
    fs.lstatSync(f);
    return true;
  } catch (e) {
    return false;
  }
}
