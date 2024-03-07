fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then((response) => response.json())
  .then((data) => {
    const dataset = data.data;

    // Extracting years from the dataset
    const years = dataset.map(function (item) {
      return new Date(item[0]);
    });

    // Mapping the dataset to include the quarter information
    const yearsQuarter = dataset.map(function (item) {
      var quarter;
      var reportMonth = item[0].substring(5, 7);

      if (reportMonth === "01") {
        quarter = "Q1";
      } else if (reportMonth === "04") {
        quarter = "Q2";
      } else if (reportMonth === "07") {
        quarter = "Q3";
      } else if (reportMonth === "10") {
        quarter = "Q4";
      }

      return item[0].substring(0, 4) + " " + quarter;
    });

    // Extracting the GDP values from the dataset
    const gdp = dataset.map(function (item) {
      return item[1];
    });

    const w = 1000;
    const h = 600;
    const padding = 60;

    // Creating a tooltip for displaying data on mouseover
    const tooltip = d3.select("body").append("div").attr("id", "tooltip").style("opacity", 0);

    // Setting up the x and y scales for the chart
    const xMax = new Date(d3.max(years));
    xMax.setMonth(xMax.getMonth() + 3);
    const xScale = d3
      .scaleTime()
      .domain([d3.min(years), xMax])
      .range([padding, w - padding - 10]);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(dataset, (d) => d[1])])
      .range([h - padding, padding]);

    // Creating an SVG element for the chart
    const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

    // Adding rectangles for each data point in the dataset
    svg
      .selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("data-date", (d, i) => dataset[i][0])
      .attr("data-gdp", (d, i) => dataset[i][1])
      .attr("x", (d, i) => xScale(years[i]))
      .attr("y", (d) => yScale(d[1]))
      .attr("width", 4)
      .attr("height", (d) => h - padding - yScale(d[1]))
      .attr("class", "bar")
      .attr("index", (d, i) => i)
      .on("mouseover", function (event, d) {
        // Displaying tooltip on mouseover
        const [mouseX, mouseY] = d3.pointer(event);
        var i = this.getAttribute("index");

        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip
          .html(yearsQuarter[i] + "<br>" + "$" + gdp[i].toFixed(1) + " Billion")
          .attr("data-date", dataset[i][0])
          .style("left", mouseX + 30 + "px")
          .style("top", mouseY - 30 + "px");
      })
      .on("mouseout", (d) => {
        // Hiding tooltip on mouseout
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      });

    // Creating x and y axes for the chart
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg
      .append("g")
      .attr("transform", "translate(0," + (h - padding) + ")")
      .call(xAxis)
      .attr("id", "x-axis");
    svg
      .append("g")
      .attr("transform", "translate(" + padding + ", 0)")
      .call(yAxis)
      .attr("id", "y-axis");
  });
