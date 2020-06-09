import { LoadPrefabCommond } from "./LoadPrefabCommond";
import { LoadAudioCommond } from "./LoadAudioCommond";
import { LoadConfigCommond } from "./LoadConfigCommond";

export class InitialCommond extends puremvc.MacroCommand {

    initializeMacroCommand() {
        this.addSubCommand(LoadPrefabCommond);
        this.addSubCommand(LoadAudioCommond);
        this.addSubCommand(LoadConfigCommond);
    }
}
