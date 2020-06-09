
import GameListView from "./GameListView";
import { StartUpSignal } from "../Command/StartUpSignal";
import BaseMediator from "../../View/BaseMediator";


export class GameListMediator extends BaseMediator<GameListView> {


    onRegister() {

        StartUpSignal.inst.addListener(this.onGameStart, this)
    }

    onGameStart() {
        this.View.reFreshItems();
        this.View.Show();
    }
}