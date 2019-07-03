const { counter, quarter } = require('../../reed-richards')
const getEvents = require('./get-events')
const fs = require('fs').promises
const path = require('path')
const mkcsv = require('mkcsv')

const monthly = counter('month', 'project', 'actor')
const quarterly = counter('quarter', 'project', 'actor')

const projects = [
  'ipld', 
  'ipfs', 
  'filecoin-project', 
  'ipfs-shipyard',
  'libp2p'
]

const run = async basedir => {
  let dirs = projects.map(s => path.join(basedir, s))
  let files = [].concat(...await Promise.all(dirs.map(d => {
    return fs.readdir(d).then(_files => _files.map(f => path.join(d, f)))
  })))
  let types = new Set()
  for (let file of files) {
    let project = path.dirname(file)
    project = project.slice(project.lastIndexOf('/')+1)
    for await (let event of getEvents(file)) {
      event.project = project
      let dt = new Date(event.created_at)
      event.quarter = quarter(dt)
      event.month = dt.getFullYear() + '-' + ( dt.getMonth() + 1 ).toString().padStart(2, 0)
      if (event.actor) {
        monthly.count(event)
        quarterly.count(event)
      }
    }
  }
  let lines = []
  for (let [month, map] of monthly.data.entries()) {
    let line = { month }
    for (let [project, _map] of map.entries()) {
      line[project] = _map.size
    }
    lines.push(line)
  }
  await fs.writeFile(path.join(__dirname, 'monthly.csv'), mkcsv(lines))

  lines = []
  for (let [quarter, map] of quarterly.data.entries()) {
    let line = { quarter }
    for (let [project, _map] of map.entries()) {
      line[project] = _map.size
    }
    lines.push(line)
  }
  await fs.writeFile(path.join(__dirname, 'quarterly.csv'), mkcsv(lines))
}

run('..')
