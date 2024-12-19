export type Gift = {
  id: string
  title: string
  description?: string | null
  price?: number | null
  imageUrl?: string | null
  category: string
  priority: string
  productUrl?: string | null
  reservation?: Reservation | null
}

export type Reservation = {
  id: string
  firstName: string
  lastName: string
  token: string
  isAnonymous: boolean
}

export interface ReservationData {
    giftId: string;
    firstName: string;
    lastName: string;
    message?: string;
    isAnonymous: boolean;
  }
  
  export interface SavedReservation {
    giftId: string;
    firstName: string;
    lastName: string;
    timestamp: number;
  }
  
  export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }