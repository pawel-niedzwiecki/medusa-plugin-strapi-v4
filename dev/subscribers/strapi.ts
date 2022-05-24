class StrapiSubscriber {
  private updateStrapiService: any;
  private eventBusService: { subscribe: (event: string, callBack: (data: any) => {}) => {} };

  constructor({ updateStrapiService, eventBusService }: { updateStrapiService: any; eventBusService: any }) {
    this.updateStrapiService = updateStrapiService;
    this.eventBusService = eventBusService;
    console.warn("\n Strapi Subscriber Initialized");

    this.eventBusService.subscribe("region.created", async (data: any): Promise<void> => {
      await this.updateStrapiService.createRegionInStrapi(data.id);
    });

    this.eventBusService.subscribe("region.updated", async (data): Promise<void> => {
      await this.updateStrapiService.updateRegionInStrapi(data);
    });

    this.eventBusService.subscribe("product-variant.created", async (data): Promise<void> => {
      await this.updateStrapiService.createProductVariantInStrapi(data.id);
    });

    this.eventBusService.subscribe("product-variant.updated", async (data): Promise<void> => {
      await this.updateStrapiService.updateProductVariantInStrapi(data);
    });

    this.eventBusService.subscribe("product.updated", async (data): Promise<void> => {
      await this.updateStrapiService.updateProductInStrapi(data);
    });

    this.eventBusService.subscribe("product.created", async (data): Promise<void> => {
      await this.updateStrapiService.createProductInStrapi(data.id);
    });

    this.eventBusService.subscribe("product.deleted", async (data): Promise<void> => {
      await this.updateStrapiService.deleteProductInStrapi(data);
    });

    this.eventBusService.subscribe("product-variant.deleted", async (data): Promise<void> => {
      await this.updateStrapiService.deleteProductVariantInStrapi(data);
    });

    // Blocker - Delete Region API
    this.eventBusService.subscribe("region.deleted", async (data): Promise<void> => {
      await this.updateStrapiService.deleteRegionInStrapi(data);
    });
  }
}

export default StrapiSubscriber;
