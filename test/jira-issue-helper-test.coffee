chai = require 'chai'
sinon = require 'sinon'
chai.use require 'sinon-chai'

expect = chai.expect

describe 'jira-issue-helper', ->
  beforeEach ->
    @robot =
      respond: sinon.spy()
      hear: sinon.spy()

    require('../src/jira-issue-helper')(@robot)

  it 'registers a respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/jira configure (.*)/i)

  it 'registers a respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/jira show (.*)/i)

  it 'registers a respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/jira add subtasks (.*)/i)

  it 'registers a respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/jira list tasks/i)

  it 'registers a respond listener', ->
    expect(@robot.respond).to.have.been.calledWith(/jira list subtasks/i)
