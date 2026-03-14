export interface ImageConfig {
    uri: string;
    mode?: 'contain' | 'cover' | 'stretch';
    scaleX?: number;
    scaleY?: number;
    scale?: number;
    offsetX?: number; 
    offsetY?: number;
}