export type FatesealCard = {
  name: string;
  prints: Print[];
};

export type Print = {
  id: string;
  set: string;
  collectorNumber: string;
  imageUrl: string;
  associatedCards?: AssociatedCard[];
};

export type AssociatedCard = {
  id: string;
  name: string;
  component: string;
  uri: string;
};

export type RawCard = {
  name: string;
  set?: string;
  collectorNumber?: string;
  quantity: number;
};

export type BasicCard = {
  name: string;
  imageUrl: string;
};
