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
const axios_1 = require("axios");
const IGNORE_THRESHOLD = 3; // seconds
class UpdateStrapiService extends medusa_interfaces_1.BaseService {
    constructor({ regionService, productService, redisClient, productVariantService, eventBusService }, options) {
        var _a, _b, _c;
        super();
        this.productService_ = productService;
        this.productVariantService_ = productVariantService;
        this.regionService_ = regionService;
        this.eventBus_ = eventBusService;
        this.options_ = options;
        this.protocol = this.options_.strapi_protocol;
        this.strapi_URL_STRING = `${(_a = this.protocol) !== null && _a !== void 0 ? _a : "https"}://${(_b = this.options_.strapi_url) !== null && _b !== void 0 ? _b : "localhost"}:${(_c = this.options_.strapi_port) !== null && _c !== void 0 ? _c : 1337}`;
        this.strapiAuthToken = "";
        this.checkStrapiHealth().then((res) => {
            if (res) {
                this.loginToStrapi();
            }
        });
        this.redis_ = redisClient;
    }
    addIgnore_(id, side) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${id}_ignore_${side}`;
            return yield this.redis_.set(key, 1, "EX", this.options_.ignore_threshold || IGNORE_THRESHOLD);
        });
    }
    shouldIgnore_(id, side) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${id}_ignore_${side}`;
            return yield this.redis_.get(key);
        });
    }
    getVariantEntries_(variants) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line no-useless-catch
            try {
                const allVariants = variants.map((variant) => __awaiter(this, void 0, void 0, function* () {
                    // update product variant in strapi
                    const result = yield this.updateProductVariantInStrapi(variant);
                    return result.productVariant;
                }));
                return Promise.all(allVariants);
            }
            catch (error) {
                throw error;
            }
        });
    }
    createImageAssets(product) {
        return __awaiter(this, void 0, void 0, function* () {
            const assets = yield Promise.all(product.images
                .filter((image) => image.url !== product.thumbnail)
                .map((image, i) => __awaiter(this, void 0, void 0, function* () {
                const result = yield this.createEntryInStrapi("images", product.id, {
                    image_id: image.id,
                    url: image.url,
                    metadata: image.metadata || {},
                });
                return result.image;
            })));
            return assets || [];
        });
    }
    getCustomField(field, type) {
        const customOptions = this.options_[`custom_${type}_fields`];
        if (customOptions) {
            return customOptions[field] || field;
        }
        else {
            return field;
        }
    }
    createProductInStrapi(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("products")
                .then(() => true)
                .catch((err) => {
                // console.log(err)
                return false;
            });
            if (!hasType) {
                return Promise.resolve();
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const product = yield this.productService_.retrieve(productId, {
                    relations: [
                        "options",
                        "variants",
                        "variants.prices",
                        "variants.options",
                        "type",
                        "collection",
                        "tags",
                        "images",
                    ],
                    select: [
                        "id",
                        "title",
                        "subtitle",
                        "description",
                        "handle",
                        "is_giftcard",
                        "discountable",
                        "thumbnail",
                        "weight",
                        "length",
                        "height",
                        "width",
                        "hs_code",
                        "origin_country",
                        "mid_code",
                        "material",
                        "metadata",
                    ],
                });
                if (product) {
                    return yield this.createEntryInStrapi("products", productId, product);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    createProductVariantInStrapi(variantId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("product-variants")
                .then(() => true)
                .catch(() => false);
            if (!hasType) {
                return Promise.resolve();
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const variant = yield this.productVariantService_.retrieve(variantId, {
                    relations: ["prices", "options", "product"],
                });
                // console.log(variant)
                if (variant) {
                    return yield this.createEntryInStrapi("product-variants", variantId, variant);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    createRegionInStrapi(regionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("regions")
                .then(() => true)
                .catch(() => false);
            if (!hasType) {
                console.log('Type "Regions" doesnt exist in Strapi');
                return Promise.resolve();
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const region = yield this.regionService_.retrieve(regionId, {
                    relations: ["countries", "payment_providers", "fulfillment_providers", "currency"],
                    select: ["id", "name", "tax_rate", "tax_code", "metadata"],
                });
                // console.log(region)
                return yield this.createEntryInStrapi("regions", regionId, region);
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateRegionInStrapi(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("regions")
                .then((res) => {
                // console.log(res.data)
                return true;
            })
                .catch((error) => {
                // console.log(error.response.status)
                return false;
            });
            if (!hasType) {
                return Promise.resolve();
            }
            const updateFields = ["name", "currency_code", "countries", "payment_providers", "fulfillment_providers"];
            // check if update contains any fields in Strapi to minimize runs
            const found = data.fields.find((f) => updateFields.includes(f));
            if (!found) {
                return;
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const ignore = yield this.shouldIgnore_(data.id, "strapi");
                if (ignore) {
                    return;
                }
                const region = yield this.regionService_.retrieve(data.id, {
                    relations: ["countries", "payment_providers", "fulfillment_providers", "currency"],
                    select: ["id", "name", "tax_rate", "tax_code", "metadata"],
                });
                // console.log(region)
                if (region) {
                    // Update entry in Strapi
                    const response = yield this.updateEntryInStrapi("regions", region.id, region);
                    console.log("Region Strapi Id - ", response);
                }
                return region;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateProductInStrapi(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("products")
                .then((res) => {
                // console.log(res.data)
                return true;
            })
                .catch((error) => {
                // console.log(error.response.status)
                return false;
            });
            if (!hasType) {
                return Promise.resolve();
            }
            // console.log(data)
            const updateFields = [
                "variants",
                "options",
                "tags",
                "title",
                "subtitle",
                "tags",
                "type",
                "type_id",
                "collection",
                "collection_id",
                "thumbnail",
            ];
            // check if update contains any fields in Strapi to minimize runs
            const found = data.fields.find((f) => updateFields.includes(f));
            if (!found) {
                return Promise.resolve();
            }
            // eslint-disable-next-line no-useless-catch
            try {
                const ignore = yield this.shouldIgnore_(data.id, "strapi");
                if (ignore) {
                    console.log("Strapi has just updated this product which triggered this function. IGNORING... ");
                    return Promise.resolve();
                }
                const product = yield this.productService_.retrieve(data.id, {
                    relations: [
                        "options",
                        "variants",
                        "variants.prices",
                        "variants.options",
                        "type",
                        "collection",
                        "tags",
                        "images",
                    ],
                    select: [
                        "id",
                        "title",
                        "subtitle",
                        "description",
                        "handle",
                        "is_giftcard",
                        "discountable",
                        "thumbnail",
                        "weight",
                        "length",
                        "height",
                        "width",
                        "hs_code",
                        "origin_country",
                        "mid_code",
                        "material",
                        "metadata",
                    ],
                });
                if (product) {
                    yield this.updateEntryInStrapi("products", product.id, product);
                }
                return product;
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateProductVariantInStrapi(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("product-variants")
                .then((res) => {
                // console.log(res.data)
                return true;
            })
                .catch((error) => {
                // console.log(error.response.status)
                return false;
            });
            if (!hasType) {
                return Promise.resolve();
            }
            const updateFields = [
                "title",
                "prices",
                "sku",
                "material",
                "weight",
                "length",
                "height",
                "origin_country",
                "options",
            ];
            // Update came directly from product variant service so only act on a couple
            // of fields. When the update comes from the product we want to ensure
            // references are set up correctly so we run through everything.
            if (data.fields) {
                const found = data.fields.find((f) => updateFields.includes(f));
                if (!found) {
                    return Promise.resolve();
                }
            }
            try {
                const ignore = yield this.shouldIgnore_(data.id, "strapi");
                if (ignore) {
                    return Promise.resolve();
                }
                const variant = yield this.productVariantService_.retrieve(data.id, {
                    relations: ["prices", "options"],
                });
                console.log(variant);
                if (variant) {
                    // Update entry in Strapi
                    const response = yield this.updateEntryInStrapi("product-variants", variant.id, variant);
                    console.log("Variant Strapi Id - ", response);
                }
                return variant;
            }
            catch (error) {
                console.log("Failed to update product variant", data.id);
                throw error;
            }
        });
    }
    deleteProductInStrapi(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("products")
                .then(() => true)
                .catch((err) => {
                // console.log(err)
                return false;
            });
            if (!hasType) {
                return Promise.resolve();
            }
            const ignore = yield this.shouldIgnore_(data.id, "strapi");
            if (ignore) {
                return Promise.resolve();
            }
            return yield this.deleteEntryInStrapi("products", data.id);
        });
    }
    deleteProductVariantInStrapi(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const hasType = yield this.getType("product-variants")
                .then(() => true)
                .catch((err) => {
                // console.log(err)
                return false;
            });
            if (!hasType) {
                return Promise.resolve();
            }
            const ignore = yield this.shouldIgnore_(data.id, "strapi");
            if (ignore) {
                return Promise.resolve();
            }
            return yield this.deleteEntryInStrapi("product-variants", data.id);
        });
    }
    // Blocker - Delete Region API
    deleteRegionInStrapi(data) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getType(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.strapiAuthToken) {
                yield this.loginToStrapi();
            }
            const config = {
                url: `${this.strapi_URL_STRING}/${type}`,
                method: "get",
                headers: {
                    Authorization: `Bearer ${this.strapiAuthToken}`,
                },
            };
            return (0, axios_1.default)(config);
        });
    }
    checkStrapiHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = {
                method: "head",
                url: `${this.strapi_URL_STRING}/_health`,
            };
            console.log("Checking strapi Health");
            return (0, axios_1.default)(config)
                .then((res) => {
                if (res.status === 204) {
                    console.log("\n Strapi Health Check OK \n");
                }
                return true;
            })
                .catch((error) => {
                if (error.code === "ECONNREFUSED") {
                    console.error("\nCould not connect to strapi. Please make sure strapi is running.\n");
                }
                return false;
            });
        });
    }
    loginToStrapi() {
        return __awaiter(this, void 0, void 0, function* () {
            const config = {
                method: "post",
                url: `${this.strapi_URL_STRING}/api/auth/local`,
                data: {
                    identifier: this.options_.strapi_medusa_user,
                    password: this.options_.strapi_medusa_password,
                },
            };
            return (0, axios_1.default)(config)
                .then((res) => {
                if (res.data.jwt) {
                    this.strapiAuthToken = res.data.jwt;
                    console.log("\n Successfully logged in to Strapi \n");
                    return true;
                }
                return false;
            })
                .catch((error) => {
                if (error) {
                    throw new Error("\nError while trying to login to strapi\n" + error);
                }
            });
        });
    }
    createEntryInStrapi(type, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.strapiAuthToken) {
                yield this.loginToStrapi();
            }
            const config = {
                method: "post",
                url: `${this.strapi_URL_STRING}/${type}`,
                headers: {
                    Authorization: `Bearer ${this.strapiAuthToken}`,
                },
                data,
            };
            return (0, axios_1.default)(config)
                .then((res) => {
                if (res.data.result) {
                    this.addIgnore_(id, "medusa");
                    return res.data.data;
                }
                return null;
            })
                .catch((error) => __awaiter(this, void 0, void 0, function* () {
                if (error && error.response && error.response.status) {
                    throw new Error("Error while trying to create entry in strapi - " + type);
                }
            }));
        });
    }
    updateEntryInStrapi(type, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.strapiAuthToken) {
                yield this.loginToStrapi();
            }
            const config = {
                method: "put",
                url: `${this.strapi_URL_STRING}/${type}/${id}`,
                headers: {
                    Authorization: `Bearer ${this.strapiAuthToken}`,
                },
                data,
            };
            return (0, axios_1.default)(config)
                .then((res) => {
                if (res.data.result) {
                    this.addIgnore_(id, "medusa");
                    return res.data.data;
                }
                return null;
            })
                .catch((error) => __awaiter(this, void 0, void 0, function* () {
                if (error && error.response && error.response.status) {
                    throw new Error("Error while trying to update entry in strapi ");
                }
            }));
        });
    }
    deleteEntryInStrapi(type, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.strapiAuthToken) {
                yield this.loginToStrapi();
            }
            const config = {
                method: "delete",
                url: `${this.strapi_URL_STRING}/${type}/${id}`,
                headers: {
                    Authorization: `Bearer ${this.strapiAuthToken}`,
                },
            };
            return (0, axios_1.default)(config)
                .then((res) => {
                if (res.data.result) {
                    return res.data.data;
                }
                return null;
            })
                .catch((error) => __awaiter(this, void 0, void 0, function* () {
                if (error && error.response && error.response.status) {
                    throw new Error("Error while trying to delete entry in strapi ");
                }
            }));
        });
    }
    doesEntryExistInStrapi(type, id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.strapiAuthToken) {
                yield this.loginToStrapi();
            }
            const config = {
                method: "get",
                url: `${this.strapi_URL_STRING}/${type}/${id}`,
                headers: {
                    Authorization: `Bearer ${this.strapiAuthToken}`,
                },
            };
            return (0, axios_1.default)(config)
                .then((res) => {
                return true;
            })
                .catch((error) => {
                console.log(error.response.status, id);
                throw new Error("Given entry doesn't exist in Strapi");
            });
        });
    }
}
exports.default = UpdateStrapiService;
