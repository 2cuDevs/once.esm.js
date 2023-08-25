#!/bin/bash

test.init()
{
  set -x
  export PS4='+${LINENO}: '
  source debug 
  source 'lib.trap.sh'
  set -x

  This=$(which $0)
  this=$(basename $This)
  TEST_COMMAND=$1
  TEST_SCRIPT=$(which $TEST_COMMAND)
  TEST_CASES="$TEST_COMMAND.test.cases.sh"
  shift

  RETURN=( "$@" )
}

test.exec.all.tests()
{
  echo "start executing tests of $TEST_CASES"
  #source $TEST_COMMAND
  source $TEST_CASES
  TEST_SCRIPT=tests/createdtests
  mkdir tests
  mkdir tests/logs
  grep "^.*test.$TEST_COMMAND.*()" $TEST_CASES | sed "s/\(.*\)()/test.case \1/" >$TEST_SCRIPT
  chmod 700 $TEST_SCRIPT
  source $TEST_SCRIPT

}

test.case()
{
  TEST_CASE=$1
  echo "test case: $TEST_CASE"

  $1 >tests/logs/$TEST_CASE.log 2>&1
  cat  tests/logs/$TEST_CASE.log
  echo "done with test case: $TEST_CASE"
  echo "RETURN=$RETURN"
  echo "
  ------
  "
}


function test.stage()                # transitions to the next state of th ONCE STATE MACHINE and saves it for recovery
{
  debug.log "once.stage: -$1-  RETURN=-$RETURN- @=-$@-"
  
  if [ -n "$1" ]; then
	  TEST_STATE=$1
    #test.hibernate update
  fi
  if [ "$TEST_STATE" = "stage" ] ; then
	  ONCE_STATE=status
    test.stage
    return
  fi
  if [ -z "$TEST_STATE" ] ; then
	  ONCE_STATE=discover
  fi
  test -t 1 && tput bold; tput setf 6                                    ## white yellow
  echo "Once transition to: $ONCE_STATE $@"
  test -t 1 && tput sgr0 # Reset terminal
  shift
  
  if [ "ON" = "$DEBUG" ]; then 
    stepDebugger ON
  fi

  test.$TEST_STATE "$@"
  if [ "$?" = "0" ]; then
    return $?
  else
    err.log "$?"
    test.stage done
  fi
}

test.start()                # starts the Once Server in the background and remembers its PID; that is if no ohter instance of once is running (the forceful start of another once server is on a dynamic port counting upward from 8080)
{
  source debug

  if [ $# = 0 ]; then 
        console.log "no parameters!"
        console.log "$this: Bye"
        exit 0
  fi
  test.init "$@"
  shift
  source $TEST_CASES
  #console.log "\$1=-$1-   sourcing $TEST_SCRIPT"
  grep "^.*test.$TEST_COMMAND.*()" $TEST_CASES | sed "s/(.*)\(\)/$1/"
  test.exec.all.tests "$@"

  while [ -n "$1" ]; do
    debug.log "start 1: -$1-"
    case $1 in
      call)
        shift
        "$@"
        RETURN=$1
        ;;
      discover)
        
        if [ "$ONCE_STATE" = "disvocer" ]; then
          ONCE_STATE=check.installation
          test.stage
        fi
        ;;
      '')
        debug.log "$0: EXIT"
        #exit 0
        return
        ;;
      *)
        console.log "test.stage to: $@"
        test.stage "$@"
    esac

    while [ ! "$RETURN" = "$1" ]; do
      shift
      debug.log "shift:  -Return:$RETURN-  -$1- -command=$COMMANDS-  =$@="
      if [ -z $1 ]; then
        debug.log "force stop"
        RETURN=
        exit 0
      fi
    done
    debug.log "found"
    
  done
  debug.log "will stage"
  test.stage $ONCE_STATE
}

test.start "$@"
