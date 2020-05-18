//function to populate a select menu w/ the sample names
function sampleNamesSelect() {
  const selDataset = document.querySelector('#selDataset');
  const url = '/names';
  Plotly.d3.json(url, (error, response) => {
    if (error) return console.warn(error);
    response.map(sample => {
      let option = document.createElement('option')
      option.text = sample;
      option.value = sample;
      selDataset.appendChild(option);
    });
  });
}

//function to handle when a new sample is selected
function optionChanged(sample) {
  showMetadata(sample);
  showPie(sample);
  showBubble(sample);
}

//get the otu descriptions
function otuDescriptions(idList) {
  const url = '/otu';
  let otuDescArray = [];
  Plotly.d3.json(url, (error, response) => {
    if (error) return console.warn(error);
    //loop through idList and subtract one to get the index
    for (let i = 0; i < idList.length; i++) {
      let index = idList[i] - 1;
      let otuDesc = `${response[index]}`;
      otuDescArray.push(otuDesc);
    }
  });
  return otuDescArray;
} 

//make the metadata display
function showMetadata(sample) {
  const url = `/metadata/${sample}`;
  const metadataText = document.querySelector('#metadata-text');
  Plotly.d3.json(url, (error, response) => {
    if (error) return console.warn(error);
    //initialize
    metadataText.innerHTML = '';
    //loop through the dictionary
    for(let key in response) {
      metadataText.innerHTML += `${key}: ${response[key]} <br>`;
    }
  });
}
    
//make the pie chart
function showPie(sample) {
  const url = `/samples/${sample}`;
  Plotly.d3.json(url, (error, response) => {
    if (error) return console.warn(error);
    
    //get the top ten values and labels accounting for < 10
    let samplesZeroes = response[0]['sample_values'].slice(0, 10);
    let stop = 10;
    if (samplesZeroes.indexOf(0) > 0) {
      stop = samplesZeroes.indexOf(0);
    }
    let pieLabels = response[0]['otu_ids'].slice(0, stop);
    let pieValues = samplesZeroes.slice(0, stop);

    //get the text labels
    let pieText = otuDescriptions(pieLabels);

    //set up the pie chart
    let data = [{
      values: pieValues,
      labels: pieLabels,
      hovertext: pieText,
      hoverinfo: 'label+text+value+percent',
      type: 'pie'
    }];
    let layout = {
      height: 500,
      width: 800,
      title: `Top Sample Counts for ${sample}`
    };

    //plot it
    Plotly.react('pie-chart', data, layout);
  });
}

//make the bubble chart
function showBubble(sample) {
  const url = `/samples/${sample}`;
  Plotly.d3.json(url, (error, response) => {
    if (error) return console.warn(error);

    //stop pulling when it hits 0
    let samplesZeroes = response[0]['sample_values'];
    let stop = samplesZeroes.indexOf(0);
    let otuIDs = response[0]['otu_ids'].slice(0, stop);
    //let textPull = otuDescriptions(otu_ids);
    let sampleVals = samplesZeroes.slice(0, stop);
    
    //get the hover text

    /** ~~For some reason, the below otuDescriptions call does 
    return the correct array but won't work for the hover text 
    (evaluation order?). So for now, I've just put the function 
    in here, which of course defeats the purpose of having it in 
    the first place. I'll research more to figure this out.~~ **/
    //let bubbleText = otuDescriptions(otuIDs);

    //hover text workaround
    const otuURL = '/otu';
    let otuDescArray = [];
    Plotly.d3.json(otuURL, (error, response) => {
      if (error) return console.warn(error);
      //loop through idList and subtract one to get the index
      for (let i = 0; i < otuIDs.length; i++) {
        let index = otuIDs[i] - 1;
        let otuDesc = `${response[index]}`;
        otuDescArray.push(otuDesc);
      }
      
      //set up the chart
      let data = [{
        x: otuIDs,
        y: sampleVals,
        //text: bubbleText,
        text: otuDescArray,
        mode: 'markers',
        marker: {
          color: otuIDs,
          size: sampleVals,
          colorscale: 'Portland'
        },
        type: 'scatter'
      }];
      let layout = {
        height: 700,
        width: 1200,
        hovermode: 'closest',
        title: `${sample} Sample Values`,
        yaxis: {
          title: 'Sample Value'
        },
        xaxis: {
          title: 'OTU ID'
        },
      };

      //plot it
      Plotly.react('bubble-chart', data, layout);
    });
  });
}
   
//populate the select menu
sampleNamesSelect();

//initialize w/ the first sample
optionChanged('BB_940');
