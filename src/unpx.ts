import { DlxCmd } from "./commands/dlx";
import { UnpxCmd } from "./commands/unpx";

const unpxCmd = new UnpxCmd();

new DlxCmd(unpxCmd).register(true);

unpxCmd.exec();
