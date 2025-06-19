import 'fabric';

declare module 'fabric' {
  namespace fabric {
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
