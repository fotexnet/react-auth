export default interface IResponse<TData extends Record<string, unknown> | never[]> {
  http_status_code: number;
  status: boolean;
  message: string;
  data: TData;
  errors: Error[];
}

export type Error = {
  field: string;
  message: string;
};
