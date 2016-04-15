function circlesTimelineChart(data,stylename,media,plotpadding,legAlign,yHighlight){

	//graph options
    var lineSmoothing="monotone";//choose 'linear' for an unsmoothed line
    var titleYoffset = d3.select("#"+media+"Title").node().getBBox().height
    var subtitleYoffset=d3.select("#"+media+"Subtitle").node().getBBox().height
    //console.log(data)

    //Select the plot space in the frame from which to take measurements
    var frame=d3.select("#"+media+"chart")
    var plot=d3.select("#"+media+"plot")
    
    //Get the width,height and the marginins unique to this plot
    var w=plot.node().getBBox().width;
    var h=plot.node().getBBox().height;
    var margin=plotpadding.filter(function(d){
        return (d.name === media);
      });
    margin=margin[0].margin[0]
    var plotWidth = w-margin.left-margin.right;
    var plotHeight = h-margin.top-margin.bottom;
    var colours=stylename.fillcolours;
    var maxCircle = (plotWidth/100)*6; // the size of the largest circle

    //set up an array of all the dates and values which we need to work out the range of the data
    var dates = new Array();
    var values = new Array();

    //parse the data
    data.forEach(function(d) {
            dates.push(d.date);
            values.push(d.value);
    });

    //establish range of dates
    dates =dates.sort(sortFunction);
    var dateRange=[dates[0],dates[dates.length-1]];
    //calculate number of days between dates - needed later for ticks
    var numDays = daydiff(dates[0],dates[dates.length-1]);

    //establish max data value
    values = values.sort(sortFunction);
    var maxValue=values[values.length-1];

    //establish proportional sizes
    var radius = d3.scale.sqrt()
        .domain([0, maxValue])
        .range([0, maxCircle]);

    //set up the scale we will use for plotting out the timeline
    var xScale = d3.time.scale()
        .domain(dateRange)
        .range([0, w-(margin.left+margin.right)]);

    //define a main axis based on the scale
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom');

    //define another axis based on days
    var dayAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .tickFormat('');

    //roll up the data by category
    var catData = d3.nest()
        .key(function(d,i){return d.category;})
        .entries(data);

    //set up document structure
    var svg=plot.append('g')
            .attr({
                'transform':'translate('+margin.left+','+maxCircle*2.5+margin.top+')'
            });

    var timelines = svg.selectAll('g')
        .data(catData)
            .enter()
        .append('g')
            .attr('id' , function(d){ 
                return d.key; })
            .attr('transform',function(d,i){
                    return 'translate('+(margin.left)+','+(i*maxCircle*2.5-maxCircle)+')'
              });

    timelines.append('text')
    .attr("class",media+"subtitle")
        .text(function(d,i){
            return d.key;
        })
        .attr('y',-(maxCircle*0.4));

    timelines.append('g')
        .attr('class', media+'yAxis')
        .call(dayAxis);

    timelines.append('g')
        .attr('class',media+'xAxis')
        .call(xAxis);

    var circles = timelines.append('g')
            .attr({
                'class': media+'circles',
                'fill': function(d,i){
                    return colours[i];  
                },
                'stroke':function(d,i){
                    return colours[i];  
                }
            })
        .selectAll('circle')
            .data(function(d){ return d.values; })
            .enter()
        .append('circle')
            .attr({
                'cy':0,
                'cx':function(d) {
                    return xScale(d.date);
                },
                'r':function(d) {
                    return radius(d.value);
                }
            });




    //sort function
    function sortFunction(a,b)    {
        return a-b;   
    }

    function daydiff(a,b)   {
        return Math.round((b-a)/(1000 * 60 * 60 * 24));   
    }

}