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
        const manager = req.scope.resolve("manager");
        const productService = req.scope.resolve("productService");
        const regionService = req.scope.resolve("regionService");
        const paymentProviderService = req.scope.resolve("paymentProviderService");
        const fulfillmentProviderService = req.scope.resolve("fulfillmentProviderService");
        const shippingProfileService = req.scope.resolve("shippingProfileService");
        const shippingOptionService = req.scope.resolve("shippingOptionService");
        const regionRepository = req.scope.resolve("regionRepository");
        const shippingProfileRepository = req.scope.resolve("shippingProfileRepository");
        const shippingOptionRepository = req.scope.resolve("shippingOptionRepository");
        const allProductsCount = yield productService.count();
        const allRegionCount = yield getCount(manager, regionRepository);
        const allShippingProfileCount = yield getCount(manager, shippingProfileRepository);
        const allShippingOptionCount = yield getCount(manager, shippingOptionRepository);
        const productFields = [
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
        ];
        const regionFields = ["id", "name", "tax_rate", "tax_code", "metadata"];
        const shippingProfileFields = ["id", "name", "type", "metadata"];
        const shippingOptionFields = [
            "id",
            "name",
            "price_type",
            "amount",
            "is_return",
            "admin_only",
            "data",
            "metadata",
        ];
        const productRelations = [
            "variants",
            "variants.prices",
            "variants.options",
            "images",
            "options",
            "tags",
            "type",
            "collection",
            "profile",
        ];
        const regionRelations = [
            "countries",
            "payment_providers",
            "fulfillment_providers",
            "currency",
        ];
        const shippingProfileRelations = [
            "products",
            "shipping_options",
            "shipping_options.profile",
            "shipping_options.requirements",
            "shipping_options.provider",
            "shipping_options.region",
            "shipping_options.region.countries",
            "shipping_options.region.payment_providers",
            "shipping_options.region.fulfillment_providers",
            "shipping_options.region.currency",
        ];
        const shippingOptionRelations = [
            "region",
            "region.countries",
            "region.payment_providers",
            "region.fulfillment_providers",
            "region.currency",
            "profile",
            "profile.products",
            "profile.shipping_options",
            "requirements",
            "provider",
        ];
        // Fetching all entries at once. Can be optimized
        const productListConfig = {
            skip: 0,
            take: allProductsCount,
            select: productFields,
            relations: productRelations,
        };
        const regionListConfig = {
            skip: 0,
            take: allRegionCount,
            select: regionFields,
            relations: regionRelations,
        };
        const shippingOptionsConfig = {
            skip: 0,
            take: allShippingOptionCount,
            select: shippingOptionFields,
            relations: shippingOptionRelations,
        };
        const shippingProfileConfig = {
            skip: 0,
            take: allShippingProfileCount,
            select: shippingProfileFields,
            relations: shippingProfileRelations,
        };
        const allRegions = yield regionService.list({}, regionListConfig);
        const allProducts = yield productService.list({}, productListConfig);
        const allPaymentProviders = yield paymentProviderService.list();
        const allFulfillmentProviders = yield fulfillmentProviderService.list();
        const allShippingOptions = yield shippingOptionService.list({}, shippingOptionsConfig);
        const allShippingProfiles = yield shippingProfileService.list({}, shippingProfileConfig);
        const response = {
            products: allProducts,
            regions: allRegions,
            paymentProviders: allPaymentProviders,
            fulfillmentProviders: allFulfillmentProviders,
            shippingOptions: allShippingOptions,
            shippingProfiles: allShippingProfiles,
        };
        res.status(200).send(response);
    }
    catch (error) {
        res.status(400).send(`Webhook error: ${error.message}`);
    }
});
// eslint-disable-next-line valid-jsdoc
/**
 * Return total number of entries for a repository
 * @return {*}
 */
function getCount(manager, repository) {
    const customRepository = manager.getCustomRepository(repository);
    return customRepository.count();
}
