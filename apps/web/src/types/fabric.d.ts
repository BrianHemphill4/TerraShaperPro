import 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface IObjectOptions {
      id?: string;
      plantId?: string;
      plantName?: string;
    }
    
    interface Object {
      id?: string;
      plantId?: string;
      plantName?: string;
      points?: { x: number; y: number }[] | fabric.Point[];
    }
    
    interface IGroupOptions extends IObjectOptions {}
    interface ICircleOptions extends IObjectOptions {}
    interface IImageOptions extends IObjectOptions {}
    
    interface Polyline {
      points?: any[];
    }
    
    interface Image {
      id?: string;
      plantId?: string;
      plantName?: string;
    }
  }
}