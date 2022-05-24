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
class StrapiSubscriber {
    constructor({ updateStrapiService, eventBusService }) {
        this.updateStrapiService = updateStrapiService;
        this.eventBusService = eventBusService;
        console.warn("\n Strapi Subscriber Initialized");
        this.eventBusService.subscribe("region.created", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.createRegionInStrapi(data.id);
        }));
        this.eventBusService.subscribe("region.updated", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.updateRegionInStrapi(data);
        }));
        this.eventBusService.subscribe("product-variant.created", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.createProductVariantInStrapi(data.id);
        }));
        this.eventBusService.subscribe("product-variant.updated", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.updateProductVariantInStrapi(data);
        }));
        this.eventBusService.subscribe("product.updated", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.updateProductInStrapi(data);
        }));
        this.eventBusService.subscribe("product.created", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.createProductInStrapi(data.id);
        }));
        this.eventBusService.subscribe("product.deleted", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.deleteProductInStrapi(data);
        }));
        this.eventBusService.subscribe("product-variant.deleted", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.deleteProductVariantInStrapi(data);
        }));
        // Blocker - Delete Region API
        this.eventBusService.subscribe("region.deleted", (data) => __awaiter(this, void 0, void 0, function* () {
            yield this.updateStrapiService.deleteRegionInStrapi(data);
        }));
    }
}
exports.default = StrapiSubscriber;
