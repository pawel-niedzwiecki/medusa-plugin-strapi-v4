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
const medusa_interfaces_1 = require("medusa-interfaces");
const redis_key_manager_1 = require("../utils/redis-key-manager");
function isEmptyObject(obj) {
    // eslint-disable-next-line guard-for-in
    for (const i in obj) {
        return false;
    }
    return true;
}
class UpdateMedusaService extends medusa_interfaces_1.BaseService {
    constructor({ productService, productVariantService, regionService, redisClient, }) {
        super();
        this.productService_ = productService;
        this.productVariantService_ = productVariantService;
        this.redisClient_ = redisClient;
        this.regionService_ = regionService;
    }
    sendStrapiProductVariantToMedusa(variantEntry, variantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignore = yield (0, redis_key_manager_1.shouldIgnore_)(variantId, "medusa", this.redisClient_);
            if (ignore) {
                return;
            }
            try {
                const variant = yield this.productVariantService_.retrieve(variantId);
                const update = {};
                if (variant.title !== variantEntry.title) {
                    update.title = variantEntry.title;
                }
                if (!isEmptyObject(update)) {
                    const updatedVariant = yield this.productVariantService_
                        .update(variantId, update)
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        return yield (0, redis_key_manager_1.addIgnore_)(variantId, "strapi", this.redisClient_);
                    }));
                    return updatedVariant;
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
    sendStrapiProductToMedusa(productEntry, productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignore = yield (0, redis_key_manager_1.shouldIgnore_)(productId, "medusa", this.redisClient_);
            if (ignore) {
                return;
            }
            try {
                // get entry from Strapi
                // const productEntry = null
                const product = yield this.productService_.retrieve(productId);
                const update = {};
                // update Medusa product with Strapi product fields
                const title = productEntry.title;
                const subtitle = productEntry.subtitle;
                const description = productEntry.description;
                const handle = productEntry.handle;
                if (product.title !== title) {
                    update.title = title;
                }
                if (product.subtitle !== subtitle) {
                    update.subtitle = subtitle;
                }
                if (product.description !== description) {
                    update.description = description;
                }
                if (product.handle !== handle) {
                    update.handle = handle;
                }
                // Get the thumbnail, if present
                if (productEntry.thumbnail) {
                    const thumb = null;
                    update.thumbnail = thumb;
                }
                if (!isEmptyObject(update)) {
                    yield this.productService_.update(productId, update).then(() => __awaiter(this, void 0, void 0, function* () {
                        return yield (0, redis_key_manager_1.addIgnore_)(productId, "strapi", this.redisClient_);
                    }));
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
    sendStrapiRegionToMedusa(regionEntry, regionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ignore = yield (0, redis_key_manager_1.shouldIgnore_)(regionId, "medusa", this.redisClient_);
            if (ignore) {
                return;
            }
            try {
                const region = yield this.regionService_.retrieve(regionId);
                const update = {};
                if (region.name !== regionEntry.name) {
                    update.name = regionEntry.name;
                }
                if (!isEmptyObject(update)) {
                    const updatedRegion = yield this.regionService_
                        .update(regionId, update)
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        return yield (0, redis_key_manager_1.addIgnore_)(regionId, "strapi", this.redisClient_);
                    }));
                    return updatedRegion;
                }
            }
            catch (error) {
                console.log(error);
                return false;
            }
        });
    }
}
exports.default = UpdateMedusaService;
