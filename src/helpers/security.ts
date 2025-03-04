function maskPassword(obj: Record<string, any>): Record<string, any> {
  if (obj.password) {
    delete obj.password;
  }

  return obj;
}

export {
  maskPassword,
};
