import { PLATFORM_ROUTES } from "../contract";
import { RestClient } from "../rest";
import {
  liquidityReportSchema,
  type LiquidityMetrics,
  type LiquidityQuery,
} from "../types/platform";

export class Liquidity {
  constructor(private readonly rest: RestClient) {}

  async get(query: LiquidityQuery = {}): Promise<LiquidityMetrics> {
    return this.rest.send({
      method: "GET",
      path: PLATFORM_ROUTES.liquidity,
      query: {
        groupBy: query.groupBy || "product",
        from: query.from,
        to: query.to,
      },
      schema: liquidityReportSchema,
      featureGated: true,
    });
  }
}
