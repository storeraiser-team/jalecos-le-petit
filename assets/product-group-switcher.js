(function () {
  'use strict';

  function ProductGroupSwitcher() {
    this.bindEvents();
  }

  ProductGroupSwitcher.prototype = {
    bindEvents: function () {
      var self = this;

      document.addEventListener('change', function (e) {
        if (e.target.matches('[data-product-color-input]')) {
          var productUrl = e.target.getAttribute('data-product-url');

          if (productUrl) {
            self.loadProduct(productUrl);
          }
        }
      });
    },

    loadProduct: function (url) {
      var self = this;
      var isModal = document.querySelector('.modal--quick-shop.modal--is-active');
      var targetUrl = url;

      var targetSection;
      if (isModal) {
        targetSection = isModal.querySelector('.product-section');
      } else {
        targetSection = document.querySelector('.product-section');
      }

      if (targetSection) {
        targetSection.classList.add('is-loading');
      }

      fetch(targetUrl)
        .then(function (response) {
          return response.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');

          if (!isModal) {
            window.history.replaceState({}, '', url);
          }

          if (isModal) {
            var newGrid = doc.querySelector('.product-section .grid');
            var currentGrid = isModal.querySelector('.product-section .grid');

            if (newGrid && currentGrid) {
              currentGrid.outerHTML = newGrid.outerHTML;

              var updatedGrid = isModal.querySelector('.product-section .grid');
              var imageColumn = updatedGrid.querySelector('.product-single__sticky');
              var descColumn = updatedGrid.querySelector('.grid__item:not(.product-single__sticky)');

              if (imageColumn) {
                imageColumn.classList.remove('medium-up--three-fifths', 'medium-up--two-fifths');
                imageColumn.classList.add('medium-up--one-half');
              }

              if (descColumn) {
                descColumn.classList.remove('medium-up--three-fifths', 'medium-up--two-fifths');
                descColumn.classList.add('medium-up--one-half');
              }

              var currentProductSection = isModal.querySelector('.product-section');
              self.reinitTheme(currentProductSection);
            }
          } else {
            var newProductSection = doc.querySelector('.product-section');
            var currentProductSection = document.querySelector('.product-section');

            if (newProductSection && currentProductSection) {
              currentProductSection.outerHTML = newProductSection.outerHTML;
              currentProductSection = document.querySelector('.product-section');

              self.reinitTheme(currentProductSection);

              setTimeout(function () {
                currentProductSection.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }, 100);
            }
          }

          setTimeout(function () {
            if (targetSection) {
              targetSection.classList.remove('is-loading');
            }
          }, 300);
        })
        .catch(function (error) {
          console.error('Error loading product:', error);
          if (!isModal) {
            window.location.href = url;
          }
        });
    },

    reinitTheme: function (container) {
      if (typeof theme !== 'undefined') {
        var sectionId = container.getAttribute('data-section-id');

        if (theme.sections && typeof theme.Product === 'function') {
          var sectionFound = false;

          if (theme.sections.instances && theme.sections.instances.length) {
            for (var i = 0; i < theme.sections.instances.length; i++) {
              var section = theme.sections.instances[i];

              if (section.type === 'product' && section.id === sectionId) {
                sectionFound = true;
                section.container = container;

                if (typeof section.cacheElements === 'function') {
                  section.cacheElements();
                }

                if (typeof section.formSetup === 'function') {
                  section.formSetup();
                }

                if (typeof section.productSetup === 'function') {
                  section.productSetup();
                }

                if (typeof section.initProductSlider === 'function') {
                  section.initProductSlider();
                }

                break;
              }
            }
          }

          if (!sectionFound) {
            theme.sections.register('product', theme.Product, container);
          }
        }

        if (typeof theme.reinitProductGridItem === 'function') {
          theme.reinitProductGridItem(container);
        }

        if (theme.collapsibles && typeof theme.collapsibles.init === 'function') {
          theme.collapsibles.init(container);
        }
      }

      var imageElements = container.querySelectorAll('image-element');
      if (imageElements.length) {
        imageElements.forEach(function (el) {
          if (el.connectedCallback) {
            el.connectedCallback();
          }
        });
      }

      // Re-initialize size chart modal after product switch
      this.initSizeChartModal(container);

      document.dispatchEvent(new CustomEvent('product:switched', {
        detail: { container: container },
        bubbles: true
      }));
    },

    // Add this new method to handle size chart modal initialization
    initSizeChartModal: function (container) {
      var sizeChartTriggers = container.querySelectorAll('[data-size-chart-trigger]');
      var sizeChartModal = container.querySelector('[data-size-chart-modal]');
      var sizeChartClose = container.querySelector('[data-size-chart-close]');
      var sizeChartCloseBtn = container.querySelector('[data-size-chart-close-btn]');

      if (!sizeChartTriggers.length || !sizeChartModal) return;

      function openModal() {
        sizeChartModal.classList.add('modal--is-active');
        document.body.classList.add('modal-open');
      }

      function closeModal() {
        sizeChartModal.classList.remove('modal--is-active');
        document.body.classList.remove('modal-open');
      }

      function handleBackgroundClick(e) {
        if (e.target === sizeChartModal) {
          closeModal();
        }
      }

      // Add event listeners to triggers
      sizeChartTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', openModal);
      });

      // Close button (X icon)
      if (sizeChartClose) {
        sizeChartClose.addEventListener('click', closeModal);
      }

      // Close button (footer button)
      if (sizeChartCloseBtn) {
        sizeChartCloseBtn.addEventListener('click', closeModal);
      }

      // Close on background click
      sizeChartModal.addEventListener('click', handleBackgroundClick);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      new ProductGroupSwitcher();
    });
  } else {
    new ProductGroupSwitcher();
  }
})();