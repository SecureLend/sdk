import { PLATFORM_ROUTES, routeWithId } from "../contract";
import { RestClient } from "../rest";
import {
  leadListSchema,
  leadSchema,
  uploadResultSchema,
  type Lead,
  type LeadCreateInput,
  type LeadListFilter,
  type RequestOptions,
  type UploadFile,
  type UploadResult,
} from "../types/platform";
import { NotFoundError, ValidationError } from "../utils/errors";

export class Leads {
  constructor(private readonly rest: RestClient) {}

  async create(
    input: LeadCreateInput,
    options: RequestOptions = {},
  ): Promise<Lead> {
    return this.rest.send({
      method: "POST",
      path: PLATFORM_ROUTES.createLead,
      body: input,
      schema: leadSchema,
      idempotencyKey: options.idempotencyKey,
    });
  }

  async list(filter: LeadListFilter = {}): Promise<Lead[]> {
    const page = await this.rest.send({
      method: "GET",
      path: PLATFORM_ROUTES.listLeads,
      query: { status: filter.status || "pending" },
      schema: leadListSchema,
    });
    return page.items;
  }

  /** Lender view. A lead outside this workspace is not found. */
  async get(id: string): Promise<Lead> {
    const wanted = String(id || "").trim();
    if (!wanted) throw new ValidationError("A lead id is required.");
    const items = await this.list({ status: "all" });
    const lead = items.find((row) => row.id === wanted);
    if (!lead) throw new NotFoundError("The record was not found.");
    return leadSchema.parse(lead);
  }

  /**
   * One HTTP request per file. The platform route stores a single file.
   */
  async uploadDocuments(
    enquiryId: string,
    files: UploadFile[],
    options: RequestOptions = {},
  ): Promise<UploadResult[]> {
    const id = String(enquiryId || "").trim();
    if (!id) throw new ValidationError("A lead id is required.");
    if (!files?.length) throw new ValidationError("A file is required.");
    const saved: UploadResult[] = [];
    for (const file of files) {
      if (!file?.bytes?.byteLength) {
        throw new ValidationError("A file is required.");
      }
      const form = new FormData();
      const copy = new ArrayBuffer(file.bytes.byteLength);
      new Uint8Array(copy).set(file.bytes);
      const blob = new Blob([copy], { type: file.mime || "application/pdf" });
      form.append("file", blob, file.filename || "upload.pdf");
      if (file.documentType) form.append("documentType", file.documentType);
      saved.push(
        await this.rest.send({
          method: "POST",
          path: routeWithId(PLATFORM_ROUTES.uploadLeadDocument, id),
          form,
          schema: uploadResultSchema,
          idempotencyKey: options.idempotencyKey,
        }),
      );
    }
    return saved;
  }
}
