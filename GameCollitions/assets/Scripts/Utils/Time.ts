export class Time {

    public static timeFormat(time: number) {
        let min = Math.floor(time / 60);
        //if (min < 10) min = "0" + min;
        let sec = Math.floor(time % 60);
        let secStr = "00";
        if (sec < 10) secStr = "0" + sec;
        return min + "/" + secStr;
    }
}