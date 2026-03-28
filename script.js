/*
 * Circular Calendar Clock - Vanilla JavaScript
 */

(function () {
  var currentDate, weekdayIndex, dateNum, monthNum;
  var arcRange = 270,
    weekdaySegments = 7,
    dateSegments = 31,
    monthSegments = 12,
    weekdayCharCount = 3,
    dateCharCount = 2,
    monthCharCount = 3,
    dateHighlightColor = "#FF2D55",
    monthHighlightColor = "#007AFF",
    weekdayHighlightColor = "#4CD964";

  // Vanilla JS lettering implementation
  function applyLettering(element) {
    var text = element.textContent;
    element.innerHTML = "";
    for (var i = 0; i < text.length; i++) {
      var span = document.createElement("span");
      span.className = "char" + (i + 1);
      span.textContent = text[i];
      element.appendChild(span);
    }
  }

  // Fade animation helper
  function fadeElement(element, duration, targetOpacity, callback) {
    var currentOpacity = parseFloat(window.getComputedStyle(element).opacity);
    var increment = (targetOpacity - currentOpacity) / (duration / 10);
    var steps = 0;
    var maxSteps = duration / 10;

    var fadeInterval = setInterval(function () {
      steps++;
      currentOpacity += increment;
      element.style.opacity = currentOpacity;

      if (steps >= maxSteps) {
        clearInterval(fadeInterval);
        element.style.opacity = targetOpacity;
        if (callback) callback();
      }
    }, 10);
  }

  // Generate CSS for character rotation
  function createCharRotationStyles(
    targetSelector,
    totalChars,
    rotationSpan,
    initialAngle
  ) {
    var angleIncrement = rotationSpan / totalChars;
    var cssRules = "";
    for (var i = 1; i <= totalChars; i++) {
      var charRotation = initialAngle + angleIncrement * i;
      cssRules +=
        targetSelector +
        " .char" +
        i +
        " { transform: rotate(" +
        charRotation +
        "deg); }";
    }
    return cssRules;
  }

  // Inject generated styles
  function injectStyles() {
    var generatedStyles = document.createElement("style");
    generatedStyles.innerHTML =
      createCharRotationStyles(".initial-text", 6, 120, -60) +
      createCharRotationStyles(".weekday-label", 9, 90, -45) +
      createCharRotationStyles(".weekday-content", 28, 270, -135) +
      createCharRotationStyles(".date-label", 4, 90, -45) +
      createCharRotationStyles(".date-content", 93, 270, -135) +
      createCharRotationStyles(".month-label", 6, 90, -45) +
      createCharRotationStyles(".month-content", 48, 270, -135);
    document.head.appendChild(generatedStyles);
  }

  // Rotate ring and highlight characters
  function adjustRingPosition(
    selectedValue,
    totalSegments,
    charsPerSegment,
    ringElement,
    textElement,
    highlightColor
  ) {
    var segmentAngle = arcRange / totalSegments;
    var baseRotation = 135 - segmentAngle / 2;
    var finalRotation = baseRotation - segmentAngle * (selectedValue - 1);
    var startCharIndex =
      charsPerSegment * (selectedValue - 1) + (selectedValue - 1) + 1;

    ringElement.style.transform = "rotate(" + finalRotation + "deg)";
    ringElement.style.webkitTransform = "rotate(" + finalRotation + "deg)";

    var chars = textElement.querySelectorAll("span");
    for (var i = startCharIndex; i < startCharIndex + charsPerSegment; i++) {
      if (chars[i - 1]) {
        chars[i - 1].style.color = highlightColor;
      }
    }
  }

  // Update clock pointers
  function animateClockPointers() {
    setInterval(function () {
      var now = new Date();
      var secs = now.getSeconds();
      var mins = now.getMinutes();
      var hrs = now.getHours();
      var secAngle = secs * 6;
      var minAngle = mins * 6;
      var hrAngle = hrs * 30 + mins / 2;

      var secWrapper = document.getElementById("sec-wrapper");
      var minWrapper = document.getElementById("min-wrapper");
      var hrWrapper = document.getElementById("hr-wrapper");

      secWrapper.style.transform = "rotate(" + secAngle + "deg)";
      secWrapper.style.webkitTransform = "rotate(" + secAngle + "deg)";

      minWrapper.style.transform = "rotate(" + minAngle + "deg)";
      minWrapper.style.webkitTransform = "rotate(" + minAngle + "deg)";

      hrWrapper.style.transform = "rotate(" + hrAngle + "deg)";
      hrWrapper.style.webkitTransform = "rotate(" + hrAngle + "deg)";
    }, 1000);
  }

  function setupClock() {
    // Apply lettering to all text elements
    applyLettering(document.querySelector(".initial-text"));
    applyLettering(document.querySelector(".weekday-label"));
    applyLettering(document.querySelector(".weekday-content"));
    applyLettering(document.querySelector(".date-label"));
    applyLettering(document.querySelector(".date-content"));
    applyLettering(document.querySelector(".month-label"));
    applyLettering(document.querySelector(".month-content"));

    // Inject rotation styles
    injectStyles();

    // Set initial visibility
    var dateLabel = document.querySelector(".date-label");
    var monthLabel = document.querySelector(".month-label");
    var weekdayLabel = document.querySelector(".weekday-label");
    var initialText = document.querySelector(".initial-text");

    dateLabel.style.opacity = 1;
    monthLabel.style.opacity = 1;
    weekdayLabel.style.opacity = 1;
    initialText.style.opacity = 1;

    // Retrieve current date information
    currentDate = new Date();
    weekdayIndex = currentDate.getDay();
    dateNum = currentDate.getDate();
    monthNum = currentDate.getMonth() + 1;

    if (weekdayIndex === 0) {
      weekdayIndex = 7;
    }

    // Animate date ring
    setTimeout(function () {
      fadeElement(dateLabel, 500, 0);
      fadeElement(document.querySelector(".date-content"), 500, 1, function () {
        adjustRingPosition(
          dateNum,
          dateSegments,
          dateCharCount,
          document.getElementById("date-ring"),
          document.querySelector(".date-content"),
          dateHighlightColor
        );
      });
    }, 500);

    // Animate month ring
    setTimeout(function () {
      fadeElement(monthLabel, 500, 0);
      fadeElement(
        document.querySelector(".month-content"),
        500,
        1,
        function () {
          adjustRingPosition(
            monthNum,
            monthSegments,
            monthCharCount,
            document.getElementById("month-ring"),
            document.querySelector(".month-content"),
            monthHighlightColor
          );
        }
      );
    }, 1000);

    // Animate weekday ring
    setTimeout(function () {
      fadeElement(weekdayLabel, 500, 0);
      fadeElement(
        document.querySelector(".weekday-content"),
        500,
        1,
        function () {
          adjustRingPosition(
            weekdayIndex,
            weekdaySegments,
            weekdayCharCount,
            document.getElementById("weekday-ring"),
            document.querySelector(".weekday-content"),
            weekdayHighlightColor
          );
        }
      );
    }, 1500);

    // Animate center clock
    setTimeout(function () {
      fadeElement(initialText, 500, 0);
      fadeElement(document.querySelector(".circle-top"), 500, 0);
      fadeElement(document.querySelector(".circle-bottom"), 500, 0);

      var pointers = document.querySelectorAll(".pointer-wrapper");
      for (var i = 0; i < pointers.length; i++) {
        fadeElement(pointers[i], 500, 1);
      }
    }, 2000);

    // Start clock animation
    animateClockPointers();
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupClock);
  } else {
    setupClock();
  }
})();