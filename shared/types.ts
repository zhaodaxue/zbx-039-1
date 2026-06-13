export interface Batch {
  id: string;
  beanType: string;
  roastDate: string;
  chargeTemp: number;
  firstCrackSec: number;
  dischargeTemp: number;
  samples: number[];
  createdAt: string;
}

export interface CreateBatchRequest {
  beanType: string;
  roastDate: string;
  chargeTemp: number;
  firstCrackSec: number;
  dischargeTemp: number;
}
