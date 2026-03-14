export interface CarouselDraggableSnapHandle {
    next: () => void;
    previous: () => void;
    toggleOverflow: () => void;
    toIndex: (index: number) => void;
    current: () => number;
}