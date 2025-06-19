import 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface IObjectOptions {
      id?: string;
      plantId?: string;
      plantName?: string;
    }
    
    interface Object {
      points?: { x: number; y: number }[] | fabric.Point[];
    }
    
    interface Polyline {
      points?: { x: number; y: number }[] | fabric.Point[];
    }
    
    interface IPolylineOptions extends IObjectOptions {
      points?: { x: number; y: number }[] | fabric.Point[];
    }
  }
}