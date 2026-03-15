export interface CarouselDraggableSnapHandle {
    next: () => void;
    previous: () => void;
    toggleOverflow: () => void;
    toIndex: (index: number) => void;
    current: () => number;
    beginExit?: (direction: 1 | -1) => void;
    completeEntry?: (targetIndex: number) => void;
}