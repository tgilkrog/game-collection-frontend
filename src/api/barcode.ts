import api from './axios';

export type BarcodeLookupResult = {
  barcode: string;
  title: string | null;
  brand: string | null;
  image: string | null;
};

export type BarcodeLookupResponse = {
  matched: boolean;
  result: BarcodeLookupResult | null;
};

export const lookupBarcode = (barcode: string) =>
  api.get<BarcodeLookupResponse>(`/barcode-lookup?barcode=${encodeURIComponent(barcode)}`);
