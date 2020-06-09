export function SingleTon<T>() {

    class ToSingleTon {
        private static ins: any;
        public static get inst(): T {
            return this.ins ? this.ins : (this.ins = new this());
        }

    }

    return ToSingleTon;
}



