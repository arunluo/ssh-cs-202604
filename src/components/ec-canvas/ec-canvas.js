Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    ec: {
      type: Object,
      value: {}
    }
  },

  data: {
    isUseNewCanvas: false
  },

  lifetimes: {
    attached() {
      // ec-canvas component ready
    }
  },

  methods: {
    init(callback) {
      this.triggerEvent('init', { callback });
    }
  }
});
