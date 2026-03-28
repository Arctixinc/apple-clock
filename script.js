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

  var mouseX = 0, mouseY = 0;
  var targetX = 0, targetY = 0;

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
    var existingStyles = document.getElementById("generated-styles");
    if(existingStyles) existingStyles.remove();

    var dateChars = dateSegments * (dateCharCount + 1);

    var generatedStyles = document.createElement("style");
    generatedStyles.id = "generated-styles";
    generatedStyles.innerHTML =
      createCharRotationStyles(".initial-text", 6, 120, -60) +
      createCharRotationStyles(".weekday-label", 9, 90, -45) +
      createCharRotationStyles(".weekday-content", 28, 270, -135) +
      createCharRotationStyles(".date-label", 4, 90, -45) +
      createCharRotationStyles(".date-content", dateChars, 270, -135) +
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
    // Reset all colors first
    for(var j=0; j<chars.length; j++) {
        chars[j].style.color = "";
        chars[j].style.textShadow = "";
    }

    for (var i = startCharIndex; i < startCharIndex + charsPerSegment; i++) {
      if (chars[i - 1]) {
        chars[i - 1].style.color = highlightColor;
        chars[i - 1].style.textShadow = "0 0 10px " + highlightColor;
      }
    }
  }

  function getDaysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }

  function updateDateRing() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    dateSegments = getDaysInMonth(month, year);

    var dateContent = document.querySelector(".date-content");
    var contentString = "";
    for(var i=1; i<=dateSegments; i++) {
        var dayStr = i < 10 ? "0" + i : "" + i;
        contentString += dayStr + (i === dateSegments ? "" : " ");
    }
    dateContent.textContent = contentString;
    applyLettering(dateContent);
    injectStyles();
  }

  // Update clock pointers and check for date changes
  function updateClock() {
    var now = new Date();
    var ms = now.getMilliseconds();
    var secs = now.getSeconds() + ms / 1000;
    var mins = now.getMinutes() + secs / 60;
    var hrs = now.getHours() + mins / 60;

    var secAngle = secs * 6;
    var minAngle = mins * 6;
    var hrAngle = (hrs % 12) * 30;

    var secWrapper = document.getElementById("sec-wrapper");
    var minWrapper = document.getElementById("min-wrapper");
    var hrWrapper = document.getElementById("hr-wrapper");

    if(secWrapper) secWrapper.style.transform = "rotate(" + secAngle + "deg)";
    if(minWrapper) minWrapper.style.transform = "rotate(" + minAngle + "deg)";
    if(hrWrapper) hrWrapper.style.transform = "rotate(" + hrAngle + "deg)";

    // Check if date components changed
    var newDateNum = now.getDate();
    var newMonthNum = now.getMonth() + 1;
    var newWeekdayIndex = now.getDay() === 0 ? 7 : now.getDay();

    if (newMonthNum !== monthNum) {
      monthNum = newMonthNum;
      updateDateRing(); // Re-generate date ring if month changes
      adjustRingPosition(
        monthNum,
        monthSegments,
        monthCharCount,
        document.getElementById("month-ring"),
        document.querySelector(".month-content"),
        monthHighlightColor
      );
    }

    if (newDateNum !== dateNum) {
      dateNum = newDateNum;
      adjustRingPosition(
        dateNum,
        dateSegments,
        dateCharCount,
        document.getElementById("date-ring"),
        document.querySelector(".date-content"),
        dateHighlightColor
      );
    }

    if (newWeekdayIndex !== weekdayIndex) {
      weekdayIndex = newWeekdayIndex;
      adjustRingPosition(
        weekdayIndex,
        weekdaySegments,
        weekdayCharCount,
        document.getElementById("weekday-ring"),
        document.querySelector(".weekday-content"),
        weekdayHighlightColor
      );
    }

    // Parallax effect
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    var containers = [".clock-center", ".weekday-circle", ".month-circle", ".date-circle"];
    containers.forEach(function(selector, index) {
        var el = document.querySelector(selector);
        if(el) {
            var depth = (index + 1) * 5;
            var moveX = targetX * depth;
            var moveY = targetY * depth;
            if(selector === ".clock-center") {
                el.style.transform = "translate(calc(-50% + " + moveX + "px), calc(-50% + " + moveY + "px))";
            } else {
                el.style.transform = "translateX(calc(-50% + " + moveX + "px)) translateY(calc(-50% + " + moveY + "px))";
            }
        }
    });

    requestAnimationFrame(updateClock);
  }

  function setupClock() {
    // Retrieve current date information
    var now = new Date();
    weekdayIndex = now.getDay() === 0 ? 7 : now.getDay();
    dateNum = now.getDate();
    monthNum = now.getMonth() + 1;

    // Initialize rings
    updateDateRing(); // Dynamically create date ring content

    // Apply lettering to other text elements
    applyLettering(document.querySelector(".initial-text"));
    applyLettering(document.querySelector(".weekday-label"));
    applyLettering(document.querySelector(".weekday-content"));
    applyLettering(document.querySelector(".date-label"));
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

    // Mouse movement tracking
    document.addEventListener("mousemove", function(e) {
        mouseX = (e.clientX / window.innerWidth) - 0.5;
        mouseY = (e.clientY / window.innerHeight) - 0.5;
    });

    // Start clock animation
    requestAnimationFrame(updateClock);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupClock);
  } else {
    setupClock();
  }
})();
