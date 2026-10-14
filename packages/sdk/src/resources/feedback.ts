import { z } from "zod";
import { PLATFORM_ROUTES, routeWithId } from "../contract";
import { RestClient } from "../rest";
import {
  FEEDBACK_TARGETS,
  FEEDBACK_TYPES,
  feedbackCreatedSchema,
  feedbackEventSchema,
  type FeedbackCreated,
  type FeedbackEvent,
  type FeedbackSubmitInput,
  type RequestOptions,
} from "../types/platform";
import { ValidationError } from "../utils/errors";

const feedbackListSchema = z
  .object({ items: z.array(feedbackEventSchema) })
  .passthrough();

export class Feedback {
  constructor(private readonly rest: RestClient) {}

  async submit(
    event: FeedbackSubmitInput,
    options: RequestOptions = {},
  ): Promise<FeedbackCreated> {
    const type = String(event?.type || "").trim();
    const kind = String(event?.target?.kind || "").trim();
    const key = String(event?.target?.key || "").trim();
    if (!FEEDBACK_TYPES.includes(type as (typeof FEEDBACK_TYPES)[number])) {
      throw new ValidationError("That feedback type is not recognized.");
    }
    if (
      !FEEDBACK_TARGETS.includes(kind as (typeof FEEDBACK_TARGETS)[number]) ||
      !key
    ) {
      throw new ValidationError("Feedback needs a target.");
    }
    if (type === "rating") {
      const rating = Number(event.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 9) {
        throw new ValidationError("A rating is a whole number from 1 to 9.");
      }
    }
    return this.rest.send({
      method: "POST",
      path: PLATFORM_ROUTES.feedback,
      body: {
        type,
        surface: event.surface || "api",
        target: { kind, key },
        ...(event.rating != null ? { rating: event.rating } : {}),
        ...(event.comment ? { comment: event.comment } : {}),
        ...(event.generationId ? { generationId: event.generationId } : {}),
        ...(event.caseId ? { caseId: event.caseId } : {}),
        ...(event.before != null ? { before: event.before } : {}),
        ...(event.after != null ? { after: event.after } : {}),
      },
      schema: feedbackCreatedSchema,
      featureGated: true,
      idempotencyKey: options.idempotencyKey,
    });
  }

  async listForCase(caseId: string): Promise<FeedbackEvent[]> {
    const id = String(caseId || "").trim();
    if (!id) throw new ValidationError("A case id is required.");
    const page = await this.rest.send({
      method: "GET",
      path: routeWithId(PLATFORM_ROUTES.caseFeedback, id),
      schema: feedbackListSchema,
      featureGated: true,
    });
    return page.items;
  }
}
