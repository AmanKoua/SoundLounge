// File to define custom data types
export interface RoomData {
  name: string;
  description: string;
  audioControlConfiguration: number; // 0 owner grants control, 1 automatic rotation
  rotationTime: number;
  isNewRoom: boolean;
}
