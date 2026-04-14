import { AddCmd } from "./commands/add";
import { DlxCmd } from "./commands/dlx";
import { ExecCmd } from "./commands/exec";
import { InstallCmd } from "./commands/install";
import { ListCmd } from "./commands/list";
import { PmCmd } from "./commands/pm";
import { RemoveCmd } from "./commands/remove";
import { RunCmd } from "./commands/run";
import { UnpmCmd } from "./commands/unpm";
import { UpdateCmd } from "./commands/update";

const unpmCmd = new UnpmCmd();

new AddCmd(unpmCmd).register();
new RemoveCmd(unpmCmd).register();
new InstallCmd(unpmCmd).register();
new ListCmd(unpmCmd).register();
new UpdateCmd(unpmCmd).register();
new ExecCmd(unpmCmd).register();
new DlxCmd(unpmCmd).register();
new RunCmd(unpmCmd).register();
new PmCmd(unpmCmd).register();

unpmCmd.exec();
