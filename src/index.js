// Basic responsive touch-enabled container using CSS transforms
// Core idea: https://css-tricks.com/the-javascript-behind-touch-friendly-containers/

import './index.scss';

let config = {
  ratio: 0.33,
  scrollDistance: 80,
  hintDuration: 2000,
  hintText: {
    back: 'Tap back',
    next: 'Tap next'
  }
};

let $container, $slider, $slides, $progress, $hint, $anchors;
let slideCount, slideWidth, containerWidth;
let offsetX, previousOffsetX;
let touchstartX, touchmoveX;
let touchstartY, touchmoveY;
let longTouch;

let transformPrefix = 'transform';
let isPassiveSupported = false;
let isRegistered = false;
let index = 0;

export default function init(_config) {
  config = Object.assign(_config, config || {});

  $container = document.getElementById(config.id);
  $slider = $container.querySelector('.tt__slider');
  $slides = $container.querySelectorAll('.tt__slide');
  $anchors = $container.querySelectorAll('.tt__slide a');

  slideCount = $slides.length;
  slideWidth = $slider.getBoundingClientRect().width;
  containerWidth = slideWidth * slideCount;

  $progress = createProgressBar($container);
  $hint = createHint($container);

  transformPrefix = getTransformPrefix();
  isPassiveSupported = getPassiveSupport();

  resize();
}

function bind() {
  const debouncedResize = debounce(resize);
  const debouncedScoll = debounce(scroll);

  window.addEventListener('resize', debouncedResize, false);

  $slider.addEventListener('click', click, false);
  $slider.addEventListener(
    'mousewheel',
    debouncedScoll,
    isPassiveSupported ? { passive: false } : false
  );
  $slider.addEventListener(
    'touchstart',
    touchstart,
    isPassiveSupported ? { passive: false } : false
  );
  $slider.addEventListener(
    'touchmove',
    touchmove,
    isPassiveSupported ? { passive: false } : false
  );
  $slider.addEventListener(
    'touchend',
    touchend,
    isPassiveSupported ? { passive: false } : false
  );

  // Dirty hack: Stop link clicks from bubbeling up
  for (let i = 0; i < $anchors.length; i++) {
    $anchors[i].addEventListener('click', stopProp, false);
  }

  isRegistered = true;
}

function click({ clientX }) {
  // Handle ordinary click events and slide left or ...
  if (clientX >= slideWidth * config.ratio && index < slideCount - 1) {
    index++;
    // ... slide right
  } else if (clientX < slideWidth * config.ratio && index > 0) {
    index--;
  }

  // Force redraw with new index
  apply();
}

function scroll() {
  if (!$hint.classList.contains('tt__hint--visible')) {
    $hint.classList.add('tt__hint--visible');

    setTimeout(() => {
      $hint.classList.remove('tt__hint--visible');
    }, config.hintDuration);
  }
}

function touchstart({ touches }) {
  longTouch = false;

  setTimeout(() => {
    $slider.longTouch = true;
  }, 250);

  // Get the original touch position.
  touchstartX = touches[0].pageX;
  touchstartY = touches[0].clientY;

  // @todo Why use a querySelector here?
  // Prevent jank if there's a transition on the elements.
  const $animated = document.querySelector('.tt__slider--animate');

  if ($animated) {
    $animated.classList.remove('tt__slider--animate');
  }
}

function touchmove({ touches }) {
  // Continuously return touch position.
  touchmoveX = touches[0].pageX;
  touchmoveY = touches[0].pageY;

  // Calculate distance to translate container.
  offsetX = index * slideWidth + (touchstartX - touchmoveX);

  // Makes the container stop moving when there is no more content.
  if (offsetX < containerWidth - slideWidth) {
    $slider.style[transformPrefix] = `translateX(-${offsetX}px)`;
  }
}

function touchend() {
  // Calculate the distance swiped.
  const deltaX = Math.abs(index * slideWidth - offsetX);

  // Show hint if user tries to scroll down
  if (touchstartY > touchmoveY + config.scrollDistance) {
    scroll();
  }

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

function resize() {
  // Add event listeners
  if (!isRegistered) {
    bind();
  }

  // @todo Disable animations during resize

  // Update viewports and slide size
  slideCount = $slides.length;
  slideWidth = $slider.getBoundingClientRect().width;
  containerWidth = slideWidth * slideCount;

  // Force redraw with new sizes
  apply();
}

function debounce(func, delay = 100, context = this) {
  let timeout;
  let funcArgs = null;
  const later = () => func.apply(context, funcArgs);

  return function() {
    if (window.requestAnimationFrame) {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(later);
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(later, delay);
    }
  };
}

function apply() {
  // Slide elements into position
  $slider.classList.add('tt__slider--animate');
  $slider.style[transformPrefix] = `translateX(-${index * slideWidth}px)`;

  const $segments = $progress.querySelectorAll('li');

  for (let i = 0; i < $segments.length; i++) {
    if (i <= index) {
      $segments[i].classList.add('tt__progress-segment--active');
    } else {
      $segments[i].classList.remove('tt__progress-segment--active');
    }
  }
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
          return isSupported = true;
        }
      })
    );
  } catch (err) {
    isSupported = false;
  }

  return isSupported;
}

function createProgressBar($container) {
  const $progress = createElement('aside', $container, [
    'className',
    'tt__progress'
  ]);
  const $progressWrapper = createElement('ul', $progress, [
    'className',
    'tt__progress-wrapper'
  ]);

  for (let i = 0; i < slideCount; i++) {
    createElement('li', $progressWrapper, [
      'className',
      'tt__progress-segment'
    ]);
  }

  return $progress;
}

function createHint($container) {
  const modes = ['back', 'next'];
  const $hint = createElement('section', $container, ['className', 'tt__hint']);

  modes.forEach(function(mode) {
    const $hintContent = createElement('div', $hint, [
      'className',
      `tt__hint-content tt__hint-content--${mode}`
    ]);
    const $hintBlock = createElement('div', $hintContent, [
      'className',
      'tt__hint-block'
    ]);
    createElement('i', $hintBlock, [
      'className',
      `tt__arrow tt__arrow--${mode}`
    ]);
    createElement('span', $hintBlock, ['textContent', config.hintText[mode]]);
  });

  return $hint;
}

function createElement(type, $parent) {
  const $element = document.createElement(type);

  for (let i = 2; i < arguments.length; i++) {
    // Check if object is an array
    if (Object.prototype.toString.call(arguments[i]) === '[object Array]') {
      $element[arguments[i][0]] = arguments[i][1];
    }
  }

  if ($parent && isElement($parent)) {
    $parent.appendChild($element);

    return $element;
  } else {
    return $element;
  }
}

function isElement($element) {
  return typeof HTMLElement === 'object'
    ? $element instanceof HTMLElement
    : $element &&
        typeof $element === 'object' &&
        $element !== null &&
        $element.nodeType === 1 &&
        typeof $element.nodeName === 'string';
}
