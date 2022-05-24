"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = req.body;
        const updateMedusaService = req.scope.resolve("updateMedusaService");
        // find Strapi entry type from body of webhook
        const strapiType = body.type;
        // get the ID
        let entryId;
        let updated = {};
        switch (strapiType) {
            case "product":
                entryId = body.data.medusa_id;
                updated = yield updateMedusaService.sendStrapiProductToMedusa(body.data, entryId);
                break;
            case "productVariant":
                entryId = body.data.medusa_id;
                updated = yield updateMedusaService.sendStrapiProductVariantToMedusa(body.data, entryId);
                break;
            case "region":
                console.log("region");
                entryId = body.data.medusa_id;
                updated = yield updateMedusaService.sendStrapiRegionToMedusa(body.data, entryId);
                break;
            default:
                break;
        }
        res.status(200).send(updated);
    }
    catch (error) {
        res.status(400).send(`Webhook error: ${error.message}`);
    }
});
