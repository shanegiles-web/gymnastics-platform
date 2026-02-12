import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = target === "body" ? req.body : target === "query" ? req.query : req.params;

      const validatedData = await schema.parseAsync(dataToValidate);

      if (target === "body") {
        req.body = validatedData;
      } else if (target === "query") {
        req.query = validatedData as any;
      } else {
        req.params = validatedData as any;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
