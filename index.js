// Basic responsive touch-enabled container using CSS transforms
// Core idea: https://css-tricks.com/the-javascript-behind-touch-friendly-containers/

const tapThrough = (() => {
  let _config = {
    ratio: 0.33,
    transformPrefix: 'transform'
  };

  let $container;
  let $slides;
  let $progress;
  let $anchors;
  let slideCount;
  let slideWidth;
  let containerWidth;
  let touchstartX;
  let touchmoveX;
  let offsetX;
  let previousOffsetX;
  let longTouch;

  let isPassiveSupported = false;
  let isRegistered = false;

  let index = 0;

  function init(config) {
    _config = Object.assign(_config, config || {});
    _config.transformPrefix = getTransformPrefix();

    $container = document.querySelector('.tt__slider');
    $slides = document.querySelectorAll('.tt__slide');
    $progress = document.querySelector('.tt__progress-bar');
    $anchors = document.querySelectorAll('.container a');

    slideCount = $slides.length;
    slideWidth = $container.getBoundingClientRect().width;
    containerWidth = slideWidth * slideCount;

    isPassiveSupported = getPassiveSupport();

    resize();
  }

  function bind() {
    $container.addEventListener('click', click, false);
    $container.addEventListener(
      'touchstart',
      start,
      isPassiveSupported ? { passive: false } : false
    );
    $container.addEventListener(
      'touchmove',
      move,
      isPassiveSupported ? { passive: false } : false
    );
    $container.addEventListener(
      'touchend',
      end,
      isPassiveSupported ? { passive: false } : false
    );

    // Dirty hack: Stop link clicks from bubbeling up
    for (let i = 0; i < $anchors.length; i++) {
      $anchors[i].addEventListener('click', stopProp, false);
    }

    isRegistered = true;
  }

  function unbind() {
    $container.removeEventListener('click', click, false);
    $container.removeEventListener(
      'touchstart',
      start,
      isPassiveSupported ? { passive: false } : false
    );
    $container.removeEventListener(
      'touchmove',
      move,
      isPassiveSupported ? { passive: false } : false
    );
    $container.removeEventListener(
      'touchend',
      end,
      isPassiveSupported ? { passive: false } : false
    );

    for (let i = 0; i < $anchors.length; i++) {
      $anchors[i].removeEventListener('click', stopProp, false);
    }

    isRegistered = false;
  }

  function start({ touches }) {
    longTouch = false;

    setTimeout(() => {
      $container.longTouch = true;
    }, 250);

    // Get the original touch position.
    touchstartX = touches[0].pageX;

    // The movement gets all janky if there's a transition on the elements.
    const $animated = document.querySelector('.animate');

    if ($animated) {
      $animated.classList.remove('animate');
    }
  }

  function move({ touches }) {
    // Continuously return touch position.
    touchmoveX = touches[0].pageX;
    // Calculate distance to translate container.
    offsetX = index * slideWidth + (touchstartX - touchmoveX);

    // Makes the container stop moving when there is no more content.
    if (offsetX < containerWidth) {
      $container.style[_config.transformPrefix] = `translateX(-${offsetX}px)`;
    }
  }

  function end() {
    // Calculate the distance swiped.
    const deltaX = Math.abs(index * slideWidth - offsetX);

    // Only slide if the actual slide position has changed.
    if (previousOffsetX !== offsetX) {
      // Calculate the index. All other calculations are based on the index.
      if (deltaX > slideWidth / 2 || longTouch === false) {
        if (offsetX > index * slideWidth && index < slideCount - 1) {
          index++;
        } else if (offsetX < index * slideWidth && index > 0) {
          index--;
        }
      }

      // Force redraw with new index
      apply();
    }

    previousOffsetX = offsetX;
  }

  function click({ clientX }) {
    // Handle ordinary click events and slide left or ...
    if (clientX >= slideWidth * _config.ratio && index < slideCount - 1) {
      index++;
      // ... slide right
    } else if (clientX < slideWidth * _config.ratio && index > 0) {
      index--;
    }

    // Force redraw with new index
    apply();
  }

  function resize() {
    // Add event listeners
    if (!isRegistered) {
      bind();
    }

    // Update viewports and slide size
    slideCount = $slides.length;
    slideWidth = $container.getBoundingClientRect().width;
    containerWidth = slideWidth * slideCount;

    // Force redraw with new sizes
    apply();
  }

  function apply() {
    // Slide elements into position
    $container.classList.add('animate');
    $container.style[_config.transformPrefix] = `translateX(-${index * slideWidth}px)`;
    $progress.style.width = `${(100 / slideCount) * (index + 1)}%`;
  }

  function stopProp(event) {
    event.stopPropagation();
  }

  // Checks what prefix is used for the style attribute transform
  function getTransformPrefix() {
    // Set default prefix
    let prefix = 'transform';

    if (typeof document.body.style.mozTransform !== 'undefined') {
      prefix = 'mozTransform';
    } else if (typeof document.body.style.msTransform !== 'undefined') {
      prefix = 'msTransform';
    } else if (typeof document.body.style.webkitTransform !== 'undefined') {
      prefix = 'webkitTransform';
    }

    return prefix;
  }

  // Check if browser supports passive event listeners
  function getPassiveSupport() {
    let isSupported = false;

    try {
      window.addEventListener(
        'test',
        null,
        Object.defineProperty({}, 'passive', {
          get() {
            isSupported = true;
          }
        })
      );
    } catch (err) {
      isSupported = false;
    }

    return isSupported;
  }

  return {
    init,
    resize
  };
})();
