import 'fabric';

declare module 'fabric' {
  namespace fabric {
    type IEvent<E extends Event = Event> = {
      e: E;
      target?: fabric.Object;
      subTargets?: fabric.Object[];
      button?: number;
      isClick?: boolean;
      pointer?: fabric.Point;
      absolutePointer?: fabric.Point;
      transform?: fabric.Transform;
    };

    type IObjectOptions = {
      id?: string;
      plantId?: string;
      plantName?: string;
    };

    type Object = {
      id?: string;
      plantId?: string;
      plantName?: string;
      points?: { x: number; y: number }[] | fabric.Point[];
    };

    type IGroupOptions = {
      id?: string;
      plantId?: string;
      plantName?: string;
    } & IObjectOptions;

    type ICircleOptions = {
      id?: string;
      plantId?: string;
      plantName?: string;
    } & IObjectOptions;

    type IImageOptions = {
      id?: string;
      plantId?: string;
      plantName?: string;
    } & IObjectOptions;

    type IPolylineOptions = {
      id?: string;
      plantId?: string;
      plantName?: string;
      points?: Array<{ x: number; y: number }> | fabric.Point[];
    } & IObjectOptions;

    type Polyline = {
      points?: Array<{ x: number; y: number }> | fabric.Point[];
    } & Object;

    type Image = {
      id?: string;
      plantId?: string;
      plantName?: string;
    } & Object;
  }
}
