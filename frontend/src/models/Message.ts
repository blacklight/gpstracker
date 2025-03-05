class Message {
  public id: string;
  public content: string;
  public icon?: string;
  public isError: boolean;
  public timeout?: number;
  public onClick: (...args: any[]) => void = () => {};

  constructor(msg: {
    id?: string;
    content: string;
    icon?: string;
    isError?: boolean;
    timeout?: number;
    onClick?: (...args: any[]) => void;
  }) {
    this.id = msg.id || Math.random().toString(36).substring(2, 11);
    this.content = msg.content;
    this.icon = msg.icon;
    this.isError = msg.isError || false;
    this.timeout = msg.timeout !== undefined ? msg.timeout : 5000;
    this.onClick = msg.onClick || this.onClick;
  }
}

export default Message;
