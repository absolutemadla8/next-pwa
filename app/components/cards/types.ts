export interface CardBaseProps {
  className?: string;
}

export interface HotelCardProps extends CardBaseProps {
  imageUrl: string;
  name: string;
  rating: number;
  description: string;
  hideOptions?: boolean;
}

export interface FlightCardProps extends CardBaseProps {
  airlineLogo: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureTime: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;
  isDirect: boolean;
  isConnecting?: boolean;
}

export interface ActivityCardProps extends CardBaseProps {
  imageUrl: string;
  title: string;
  duration: string;
  description: string;
}

export interface PlaceCardProps extends CardBaseProps {
  imageUrl: string;
  name: string;
  rating: string;
  description: string;
  isSelfTransfer?: boolean;
}
