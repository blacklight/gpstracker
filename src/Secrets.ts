class Secrets {
  public readonly serverKey: string;
  public readonly adminPassword: string;
  public readonly adminEmail: string;

  private constructor({
    serverKey,
    adminPassword,
    adminEmail,
  }: any) {
    this.serverKey = serverKey;
    this.adminPassword = adminPassword;
    this.adminEmail = adminEmail;
  }

  public static fromEnv(): Secrets {
    if (!process.env.SERVER_KEY?.length) {
      throw new Error(
        'SERVER_KEY not found in environment.\n' +
        'Generate one with `openssl rand -base64 32` and add it to your environment.'
      );
    }

    if (!process.env.ADMIN_PASSWORD?.length) {
      throw new Error('ADMIN_PASSWORD not found in environment.');
    }

    if (!process.env.ADMIN_EMAIL?.length) {
      throw new Error('ADMIN_EMAIL not found in environment.');
    }

    return new Secrets({
      serverKey: process.env.SERVER_KEY,
      adminPassword: process.env.ADMIN_PASSWORD,
      adminEmail: process.env.ADMIN_EMAIL,
    });
  }
}

export default Secrets;
