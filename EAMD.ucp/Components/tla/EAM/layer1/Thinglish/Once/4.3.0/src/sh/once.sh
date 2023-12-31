#!/bin/bash

# ONCE 4.3.0 test/sprint23

export PS4='\e[90m+${LINENO} in ${#BASH_SOURCE[@]}>${FUNCNAME[0]}:${BASH_SOURCE[@]##*/} \e[0m'
#source 'lib.trap.sh'
#DEBUG=ON
set -E
set -T
export OOSH_PATH=~/oosh

This=$(which $0)
this=$(basename $This)

once.version()              # prints out the hard coded version tag of $This | to update the script use e.g. once update here http://192.168.178.49:8080
{
 console.log "$0 version: 2021-12-02 16:00  testing"
}

if ! [ -x "$(command -v warn.log)" ]; then
    #echo "no warn.log.... mitigated using internal functions...status: ok"
    silentDebug.log() {
        if [ "ON" = "$DEBUG" ]; then
            #test -t 1 && tput setf 7     
            #echo -e "\e[1;36m- $@\e[0m"
            echo -e "\e[0m\e[90m- $@\e[0m"
            #echo "- $@"
            #test -t 1 && tput sgr0 # Reset terminal
        fi
    }

    debug.log() {
      ( { set +x; } 2>/dev/null ; silentDebug.log $@)
    }

    console.log() {
        #test -t 1 && tput bold; tput setf 7                                            ## white bold
        echo -e "\e[0m>  $@"
        #test -t 1 && tput sgr0 # Reset terminal
    }
    error.log() {
        err.log "$@"
    }
    err.log() {
        #test -t 1 && tput bold; tput setf 4  
        #echo "ERROR>  $@"
        echo -e "\e[1;31mERROR> $@\e[0m"    
        #test -t 1 && tput sgr0 # Reset terminal
        #if [ "ON" = "$DEBUG" ]; then 
            export STEP_DEBUG=ON
        #fi   
    }
    warn.log() {
        #test -t 1 && tput bold; tput setf 6
        echo -e "\e[1;33m> WARNING $@\e[0m"                                    ## white yellow
        #test -t 1 && tput sgr0 # Reset terminal
    }
    stop.log() {
        if [ "ON" = "$DEBUG" ]; then 
            #test -t 1 && tput bold; tput setf 6                                    ## white yellow
            #echo "BREAKPOINT> $@"
            echo -e "\e[1;32mBREAKPOINT: line ${BASH_LINENO[0]}> $@\e[0m" 
            #test -t 1 && tput sgr0 # Reset terminal
            export STEP_DEBUG=ON
        fi  
    }
fi

if [ -x "$(command -v debug)" ]; then
  #echo "sourcing $(which debug)"
  source debug
  export STEP_DEBUG=OFF
  #warn.log "DEBUG is $DEBUG"  
else
  debug.version()              # prints out the hard coded version tag of $This 
  {
    echo "$0 debug version: 20210626 20:45"
  }

  function silentStep() {
    ( { set +x; } 2>/dev/null ; step )
  }


  function step()
  {

    if [ "$STEP_DEBUG" = "ON" ]; then
      echo -e "\e[37m+<-----------------------------------------"
      echo "> function ${FUNCNAME[1]}(" "${BASH_ARGV[@]}" ")  in file: ${BASH_SOURCE[1]}"
      echo -e "> line: ${BASH_LINENO[1]} '${BASH_COMMAND}'\e[0m"

      read -p '' CONT

      if [[ ! "$CONT" = "" ]]; then
        case $CONT in
          h)
              echo "
              h     this help
              e     expands variable in the command
              n     next command full with debug
              ENTER next command

              d     toggle debug messages
              t     trace the stack
              s     continue silently
              c     with debug
              p     print PATH
              ll    list dir
              cd    changing to entered path
              root  tree /root
              home  tree /home
              i     check eamd
              eamd  tree workspace

              cmd   runn command (BE CAREFULL)

              q     exit
                  all other commands exit too
              "
              step
              ;;
          s)
              removeTrap
              DEBUG=OFF
              debug.log "DEBUG is OFF"
              set +x
              ;;
          n)
              #removeTrap
              DEBUG=ON
              set -x
              ;;
          x)
              DEBUG=ON
              removeTrap
              set -x
              ;;
          c)
              DEBUG=ON
              removeTrap
              set +x
              ;;
          e)
              echo "> expands to: $(eval echo "$BASH_COMMAND")"
              step
              ;;
          r)
              export STEP_TILL_NEXT_RETURN=ON
              removeTrap
              warn.log "continue till next Return"
              step
              ;;
          t)
              stackTrace
              ;;
          ls)
              ls -al
              step 
              ;;
          d)
              toggleDebug
              step
              ;;
          p)
              console.log "PATH=$PATH"
              step
              ;;
          ll)
              pwd
              ls -alF
              step
              ;;
          root)
              tree -aL 2 /root
              step
              ;;
          home)
              tree -aL 2 /home
              step
              ;;
          eamd)
              tree -aL 2 /$defaultWorkspace/..
              step
              ;;
          i)
              eamd check
              step
              ;;
          cd)
              read -p 'cd to?   >' CD_DIR
              cd $CD_DIR
              step
              ;;
          cmd)
              read -p 'command?  BE CAREFULL >' command
              set -x
              $command
              step
              ;;    
          env)
              read -p 'ENV VARIBALE NAME>' env
              set -x
              echo -e "\e[1;33mexport $env=${!env}\e[0m"
              step
              ;;          
          *)
              set +x
              warn.log "FORCE EXIT because of command: $CONT"
              exit 0
        esac
      #else
        #echo "ENTER: continue"
      fi
    #else
      #echo "Step Debug is $STEP_DEBUG"
    fi
  }

  function stackTrace() {
              i=0;
              #for (( i=0; i<=${#BASH_LINENO[@]}; i++)); do
              echo -e "\e[1;37m" 
              for l in ${BASH_LINENO[@]}; do
                  printf "i: %2d  line: %6d  function: %-20s  file: %-30s   args: " "$i" "$l" "${FUNCNAME[$i]}()" "${BASH_SOURCE[$i]}"
                  echo ${BASH_ARGV[@]}
                  ((i++))
              done
              echo -e "\e[0m"
              step
  }

  function stepDebugger() {

    if [ "$1" = "OFF" ]; then
        removeTrap
    fi
    if [ "$1" = "ON" ]; then
        export STEP_DEBUG=ON
    fi

  }

  function setTrap() {
    #echo "trap DEBUG set to step"
    #export PS4='\e[37m+${LINENO}: \e[0m'
    export PS4='\e[90m+${LINENO} in ${#BASH_SOURCE[@]}>${FUNCNAME[0]}:${BASH_SOURCE[@]##*/} \e[0m'
    
    #( trap step DEBUG ) 2>/dev/null
    trap step DEBUG 
 
    #set -e
    trap 'onError ${?}' ERR
    ( trap 'silentOnReturn ${?}' RETURN ) 2>/dev/null
    trap 'onExit  ${?}' EXIT 
  }

  function checkTrace() {
      case $- in
          *x* ) 
              echo "Trace is ON"
              export TRACE=ON
              ;;
          * )               
              echo "Trace is OFF"
              export TRACE=OFF;
              ;;
      esac
  }

  function setTrace() {
      case $TRACE in
          ON ) 
              set -x
              export TRACE=ON
              ;;
          * )               
              set +x
              export TRACE=OFF
              ;;
      esac
  }


  function removeTrap() {
    export STEP_DEBUG=OFF
    #trap - DEBUG ERR RETURN EXIT
  }

  function ckeckDebug() {

    if [[ "$(basename -- "$0")" == "debug" ]]; then
      # called
      if [ -n "$1" ]; then
          DEBUG=$1
      fi
      warn.log "debug has no effect if it was not sourced with . debug"
    else
      # sourced
      #echo "debug was sourced from: $0"
      if [[ "$(basename -- "$0")" == "-bash" ]]; then
        debug.log "sourced from: bash"
        DEBUG=$1
      fi
    fi


    if [ -n "$DEBUG" ]; then
      debug.log "DEBUG was $DEBUG, and is now ON"
      case $DEBUG in
        X)
          set -x
          ;;
        OFF)
          unset DBEUG
          ;;
        *)
          export DEBUG=ON
      esac
    else
      debug.log "DEBUG is $DEBUG"
    fi
  }

  function toggleDebug() {
      if [ "ON" = "$DEBUG" ]; then 
          DEBUG=OFF
          #set +x
      else
          DEBUG=ON
      fi
      warn.log "Toggeld DEBUG to $DEBUG"
  }

  silentOnReturn() {
    ( { set +x; } 2>/dev/null ; onReturn $@)
  }

  function onReturn() {
      debug.log "function ${FUNCNAME[1]} returned with code: $1 and RETURN=$2"
      if [ "$0" = "$2" ]; then
          #do not stop when in this $0 debug file $2
          return 0
      fi
      
      if [ "ON" = "$STEP_TILL_NEXT_RETURN" ]; then 
          STEP_TILL_NEXT_RETURN=OFF
          export STEP_DEBUG=ON
          #set +x
      fi
  #   if [ -z "$2" ]; then
  #     RETURN=$2
  #   fi
  }

  function onError() {
    #echo -e "\e[1;31m   line: ${BASH_LINENO[2]} '${BASH_COMMAND[2]}'\e[0m"
    if [ "$1" = "1" ]; then
      return
    fi

    error.log         "function ${FUNCNAME[1]} in line: ${BASH_LINENO[2]} returned with ERROR code: $1"
    if [ "ON" = "$DEBUG" ]; then
      export STEP_DEBUG=
      stackTrace
      export STEP_DEBUG=ON
    fi
  }

  function onExit() {
    debug.log "exiting"
  }

  ckeckDebug "$@"

  #debug.version
  setTrap
fi



once.check.variable(){ 
  if [ -z $1 ]; then
    echo "Variable $1 is empty";
    exit;
  fi
}





once.discover()             # discovers the environment the current once instance is hosted in
{
  # stepDebugger ON

  if [ -z "$USERHOME" ]; then
    USERHOME=$(cd;pwd)
  fi

  startDir=$(pwd)
  
  #once.update.variables

  once.isInDocker
  #once.v
  
  echo "Once.discover:
  current shell : $SHELL  (level $(($SHLVL/2)))
          script: $0
          args  : $@
          dir   : $startDir
          home  : $USERHOME

        hostname: $HOSTNAME
          type  : $HOSTTYPE
          OS    : $OSTYPE"
  
  if [[ $startDir =~ "EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once" ]]; then
    stop.log "once.sh started from \$ONCE_DIR: $startDir"
    #once.repair
  fi


  #console.log "emergency read once state from user home"
  if [ -f ~/.once ]; then
    stop.log "about to source .once"
    source ~/.once
    local result=$?
    if [ $result -ne 0 ]; then
      error.log "sourcing .once failed: $result"
      exit $result
    fi
  else
    once.state.not.installed $@
  fi



  if [ -f $ONCE_DEFAULT_SCENARIO/.once ]; then
	  source $ONCE_DEFAULT_SCENARIO/.once
    local result=$?
    if [ $result -ne 0 ]; then
      error.log "sourcing .once failed: $result"
      exit $result
    fi
  
    if [ -z ${ONCE_REPO_PREFIX} ]; then
      echo
      console.log "Variable \$ONCE_REPO_PREFIX is empty";
      echo 
      once.init
      once.update.variables

      stop.log "ïnititlized now?"
    fi  
    if [ -z ${ONCE_REPO_NAME} ]; then
      echo 
      console.log "Variable \$ONCE_REPO_NAME is empty";
      exit;
    fi  
    
    cd $ONCE_REPO_PREFIX/$ONCE_REPO_NAME
    echo "          PM    : $ONCE_PM

          REPO_DIR : $REPO_DIR
    
          repo  : $ONCE_REPO_PREFIX/$ONCE_REPO_NAME
    "
    if ! [ -x "$(command -v git)" ]; then
        echo "          branch: $(git branch --contains HEAD)
        "
    fi
	  console.log "Once.init with: $ONCE_DEFAULT_SCENARIO/.once"
    once.update.variables
    #console.log "once stage to: $ONCE_STATE"
	  #once.stage $ONCE_STATE 
    #stop.log "ONCE_DOMAIN=$ONCE_DOMAIN"
  else
    if [ "$1" = "startlog" ]; then
      once.startlog
    else
      once.state.not.installed $@
    fi
    #once.init "$@"
    #once.stage
  fi
  #checkAndFix "is privileged" " ~ = '/root' " "" "ONCE_PRIVILIDGE=root"
}

once.state.not.installed()
{
        console.log "no .once nor sceanrio discovered: exiting!   ($1)"
        warn.log "To INSTALL once please run: once install"
        case $1 in
          init)
            rm ~/.once
            once.init
            once.update.variables
            PATH=$OOSH_PATH:~/init:$(dirname ${BASH_SOURCE[0]}):.:~/scripts:$PATH
            once.pm
            once.scenario.map.save
            once.hibernate update
            #once.ci
            source ~/.once
            cd ~
            once.install.oosh
            /root/oosh/this
            #bash
            exit 0
            ;;
          install)
            shift
            once.install "$@"
            #stop.log "now going to once.init"

            exit 1
            ;;
          docker.build)
            shift
            #stop.log "now going to once.init"

            once.init

            once.check.privileges
            warn.log "returned form: once.check.privileges   .... should EXIT now after: once docker.build"

            warn.log "changing to scenario domain: $1"
            set -x
            once.update.variables
            once.scenario.check
            once.scenario.fix $1
            once.bind.with.proxy $1

            #links.fix
            exit 0
            ;;
          start)
            shift
            #stop.log "now going to once.init"
            once.deprecated.docker.woda
            exit 1
            ;;
          docker.woda.start)
            shift
            #stop.log "now going to once.init"
            #once.links.fix
            
            #once.scenario.fix 
            #once.deprecated.docker.postgesql.start
            once.deprecated.docker.woda.start
            
            #docker run woda-nodejs:16.x
            exit 1
            ;;
          
          *)
            if [ -n "$1" ]; then
              once.$@
            fi
            if [ -f ~/.once ]; then
              rm ~/.once
            fi
            exit 1
            ;;
        esac
}

once.install() {
  once.init "$@"
  once.check.privileges
  warn.log "returned form: once.check.privileges   .... should EXIT now after: once start"
  #set -x
  links.fix
  #set +x
  
  docker network connect once-woda-network $(hostname)
  stop.log "type once test"  #whitespace is totally important
  cd 
  bash

}

once.v()                    # prints out the current version of once - alias for once version 
{
  once.version
}

once.ca()                # checks if and where the simple mkcert Root CA is installed 
{
  # https://github.com/FiloSottile/mkcert
  # https://blog.filippo.io/mkcert-valid-https-certificates-for-localhost/
  once.cmd mkcert 
  if [ -z "CAROOT" ]; then 
    once.ca.install
  fi
  console.log "Root CA installed in: $(mkcert -CAROOT)"
}

function once.mkcert.install() {
  if [ "$ONCE_PM" = "brew" ]; then 
    $ONCE_PM $package
    return
  else
    once.cmd libnss3-tools 
    cd
    # wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64
    # mv mkcert-v1.4.3-linux-amd64 /usr/local/bin/mkcert
    # chmod +x /usr/local/bin/mkcert
    curl -s https://api.github.com/repos/FiloSottile/mkcert/releases/latest| grep browser_download_url  | grep linux-amd64 | cut -d '"' -f 4 | wget -qi -
    mv mkcert-v*-linux-amd64 mkcert
    chmod a+x mkcert
    mv mkcert /usr/local/bin/
  fi

  
}

once.ca.install()         # installs the simple mkcert Root CA
{
  CAROOT=$SCENARIOS_DIR/rootCA/mkcert
  console.log "Installing Root CA mkcert in: $CAROOT"
  export CAROOT
  mkcert -install
  NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
  export NODE_EXTRA_CA_CERTS
  ONCE_EXPORT_NODE_EXTRA_CA_CERTS=$NODE_EXTRA_CA_CERTS
  ONCE_EXPORT_CAROOT=$CAROOT
  
  once.hibernate update
}

once.cu()                  # certifcate update for localhost for the Once Server
{
  once.localhost.certificates
}

once.localhost.certificates() # creates localhost cerifikates for the Once Server
{
  once.ca
  #cd $ONCE_DIR
  cd $ONCE_DEFAULT_SCENARIO
  mkcert -cert-file once.cert.pem -key-file once.key.pem -p12-file once.pfx  server.localhost localhost 127.0.0.1 ::1
}

# once.scu()
# {
#   once.copy.cerbot.certificates "$1"
#   shift
#   RETURN=$1
# }

once.copy.cerbot.certificates()
{
  cd $ONCE_DEFAULT_SCENARIO
  local hostname=$ONCE_DEFAULT_HOST
  if [ -n "$1" ]; then
    console.log "Setting hostname to: $1"
    hostname=$1
    shift
  fi
  checkAndFix "delete once.cert.pem" -f "once.cert.pem" "rm once.cert.pem" 
  checkAndFix "delete once.key.pem" -f "once.key.pem" "rm once.key.pem" 

  checkAndFix "$hostname once.cert.pem" -L "once.cert.pem" "ln -s ../../Docker/CertBot/1.7.0/config/conf/live/$hostname/cert.pem once.cert.pem" 
  checkAndFix "$hostname once.key.pem" -L "once.key.pem" "ln -s ../../Docker/CertBot/1.7.0/config/conf/live/$hostname/privkey.pem once.key.pem" 
}


function once.repair()      # (CAUTION> not fully tested) should be executed from the ONCE Directory. Will repair settings for the current checked out Repository 
{
    local dir=$1
    if [ -z "$dir" ]; then
      dir=$ONCE_DIR
    else
      shift
    fi
    cd $dir
    console.log "   starting repair mode:"
    console.log "       This: $This
          this: $this
      ONCE_DIR: $dir
           pwd: $(pwd)
    "
    #set -x
    while [ ! $(basename $(pwd)) == "EAMD.ucp" ]; do
      console.log $(basename $(pwd))
      cd ..
    done
    cd ..
    ONCE_REPO_PREFIX=$(pwd)
    console.log "ONCE_REPO_PREFIX: $ONCE_REPO_PREFIX"
    rm -Rf ~/scripts.old
    mv ~/scripts ~/scripts.old
    rm ~/.bashrc
    once.clean up
    cd
    ln -s $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts
    #ln -s ~/scripts/templates/.bashrc
    cp ~/scripts/templates/.bashrc ~/.bashrc

    ONCE_DEFAULT_SCENARIO=
    RETURN=$1
    #cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh
    #once.update here
    #exit 0
}


function once.isInDocker()  # checks if the script is executed in a docker container
{
    echo "is in docker?"
    if [ -z "$HOSTNAME" ]; then
      HOSTNAME=$(hostname)
    fi

    if [ -f /.dockerenv ]; then
      console.log "inside of docker"
      ONCE_MODE=IN_DOCKER
      if [ -n "$ONCE_DOCKER_HOST"  ]; then
        console.log "found ONCE_DOCKER_HOST: $ONCE_DOCKER_HOST"
        HOSTNAME=$ONCE_DOCKER_HOST
        console.log "usineg it as HOSTNAME: $HOSTNAME"
      else
        if [ ! "$ONCE_DOMAIN" = ".docker.local" ]; then
          ONCE_DOMAIN=".docker.local"
          if [[ ! $HOSTNAME =~ "$ONCE_DOMAIN" ]]; then
            ONCE_CURRENT_DOCKER_CONTAINER=$HOSTNAME
            HOSTNAME=$HOSTNAME$ONCE_DOMAIN
          fi
        fi
      fi
    else
      if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
        ONCE_MODE=DOCKER
      else
        ONCE_MODE=LOCAL
      fi
      if [ -z ${ONCE_MODE} ]; then
        echo 
        console.log "Variable \$ONCE_MODE is empty";
        echo
        exit;
      fi
      console.log "  ONCE_MODE=$ONCE_MODE on host $HOSTNAME"
        
    fi
    #stop.log "ONCE_DOMAIN=$ONCE_DOMAIN"
}


once.help()                 # prints a list of all commands for once
{
  local detail=$1
  if [ -n "$detail" ]; then
    shift
  fi
  grep "^once\.$detail.*()" $This | sed 's/^\(once\.\)\(.*\)/\2/' | sort
}

once.superuser()            # prints a list of all the advanced superuser functions in once.sh
{
  local detail=$1
  if [ -n "$detail" ]; then
    shift
  fi
  console.log "This are the advanced funtions for superusers in $This:"
  grep "^function once\.$detail.*()" $This | sed 's/^\(function once\.\)\(.*\)/\2/' | sort
  #exit 0
}
once.su()                   # alias to once.superuser to list advanced functions ot $This
{
  once.superuser "$@"
}

function checkAndFix()      # checkes and fixing/adding files
{
    debug.log "checkAndFix(1:$1 2:$2 3:$3 4:$4  silent:$5)"
    if [ $2 "$3" ]; then
        if [ -z "$5" ]; then
    	    echo "check: ok     : $1: $3"
        fi
    else
        if [ -z "$5" ]; then
          echo "check: failed : $1: $3        ...fixing with: $4"
        fi
        $4
    fi
}




once.cmd()                  # checks if the <command> is available or is being installed via the package manager in $ONCE_PM, if the package name is diffrent it can be specify with e.g. once cmd ssh openssl 
{

    current=$1
    shift
    package=$1
    shift
    if [ -z "$package" ]; then
        package=$current
    else
      shift
      package=$1
    fi   
    
    if [ -z "$ONCE_PM" ]; then
      console.log "no PM found...checking" 
      once.check.all.pm
    fi
    if ! [ -x "$(command -v $current)" ]; then
        console.log "no $current"
        if [ -n "$ONCE_PM" ]; then
          case $current in
            eamd)
              once.load $current tla/EAMD/UcpComponentSupport/1.0.0/src/sh/eamd
              export PATH=$PATH:/root/init
              mkdir -p /root/init
              cp $ONCE_LOAD_DIR/eamd /root/init/eamd
              hash -d eamd    #clears the command cache for eamd

              #hash -r   #clears the command cache completley
              ;;
            oosh)
              once.load $current com/ceruleanCircle/EAM/1_infrastructure/OOSH/1.0.0/src/sh/oosh
              ;;
            once)
              once.load once.sh tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh
              cd $ONCE_LOAD_DIR
              mv once.sh once
              once.stage status
              ;;
            npm)
              # if ! which $current > /dev/null; then
                once.npm.install
              # else
              #   console.log "$current allready installed!";
              # fi
              # exit;
              ;;
            mkcert)
              once.mkcert.install
              ;;
            update)
              apt-get update
              ;;
            *)
              $ONCE_PM $package
            esac
        else
            console.log "no package manger"
        fi
        shift
    fi
    RETURN=$1
}
once.load()                 # loads ONCE Object Oriented SHell components (scripts) e.g: once load paths
{

  #set -x
  echo load $1
  ONCE_LOAD_DIR=$SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/latestServer/oosh
  once.path.create $ONCE_LOAD_DIR
  cd $ONCE_LOAD_DIR/
  if [ -f "$1" ]; then
    rm $1.*
    console.log "WARNING: the file is already downloaded: $ONCE_LOAD_DIR/$1"
    console.log "Please add it to the PATH with running:   . once path"
    PATH=$PATH:$ONCE_LOAD_DIR
    hash -d eamd
  else
    #once.path
    once.cmd wget
    local url=$ONCE_DEFAULT_URL
    if [ -n "$ONCE_LOCAL_SERVER" ]; then
      url=$ONCE_LOCAL_SERVER
    fi

    wget $url/$ONCE_REPO_NAME/$ONCE_REPO_COMPONENTS/$2
    chmod 744 $1
    #set +x
    #once.stage done
  fi
}

function once.npm.install() 
{
      once.cmd curl
      if ! which npm > /dev/null; then
        curl -sL https://deb.nodesource.com/setup_16.x | bash -
        $ONCE_PM nodejs
      else
        console.log "nodejs allready installed!";
      fi
      
      once.npm.update.shell
}

function once.npm.update.shell()      # updates the shell used bey npm to /bin/bash    (on trouble with '. .once' or 'source .once' )
{
  npm config set script-shell /bin/bash
} 


function once.check.pm()             # checks for a package manager
{

    local packageManager=$1
    local packageManagerCommand=$2


    if [ -z "$packageManagerCommand" ]; then
        package=$packageManager
    fi   
    if ! [ -x "$(command -v $packageManager)" ]; then
        debug.log "no $packageManager"
    else
        if [ -z "$ONCE_PM" ]; then
            export ONCE_PM=$packageManagerCommand
            export groupAddCommand=$3
            export userAddCommand=$4
            echo "Package Manager found: using $ONCE_PM somePackage"
            if [ "$packageManager" = "apt-get" ]; then
                if [ -z "$ONCE_PM_UPDATED" ]; then
                  ONCE_PM_UPDATED="apt-get update"
                  if [ "$ONCE_PRIVILEGE" = root ]; then
                    $ONCE_PM_UPDATED
                  else 
                    PM="sudo $PM"
                  fi
                else
                  echo "in case of installation errors try to call: apt-get update"
                fi
            fi
        fi
    fi
}
function once.check.all.pm()         # adds tools and configurations to package manager (brew, apt-get, addgroup, adduser, dpkg, pkg)
{

    once.check.pm brew "brew install"    
    #once.check.pm apt "apt add"
    once.check.pm apt-get "apt-get -y install" "groupadd -f" "useradd -g dev"
    once.check.pm apk "apk add" "addgroup" "adduser -g dev"
    once.check.pm dpkg "dpkg install"
    once.check.pm pkg "pkg install"
    once.check.pm pacman "pacman -S"

 
}
function once.pm()                   # calls package manager 
{

  ONCE_PM=
  once.check.all.pm
  console.log "PM: $ONCE_PM"

  RETURN=$1
}

once.scenario()
{
  once.scenario.check
  once.cmd tree
  tree -aL 6 $ONCE_SCENARIO
} 

once.scenario.create()    # creates a Scenario directory in the current $ONCE_SCENARIO
{
  scenarioName=$1
  shift

  if [ -n "$1" ]; then
    scenarioVersion=$1
    shift
  else
    scenarioVersion=1.0.0
  fi

  if [ -n "$1" ]; then
    scenarioPath=$1.$scenarioVersion
    shift
  else
    warn.log "no scenarioPath specified"
    RETURN=$1
    return 1
  fi
  
  if [ -n "$1" ]; then
    scenarioImage=$1
    shift
  else
    scenarioImage=$scenarioName-image:$scenarioVersion
  fi

  if [ -n "$1" ]; then
    scenarioContainer=$1
    shift
  else
    scenarioContainer=$scenarioName-app:$scenarioVersion

  fi



  once.scenario.map.load

  let i=${#SCENARIO_MAP_KEYS[@]}

  SCENARIO_MAP_KEYS[$i]=${scenarioName}
  SCENARIO_MAP_VERSION[$i]=${scenarioVersion}
  SCENARIO_MAP_DC_NAME[$i]=${scenarioContainer}
  SCENARIO_MAP_DI_NAME[$i]=${scenarioImage}
  SCENARIO_MAP_VALUES[$i]=${scenarioPath}
  
  once.scenario.map.save      

  if [ -n "$scenarioPath" ]; then
    console.log "create Scenario: $ONCE_SCENARIO/$scenarioPath/$scenarioName.$scenarioVersion"
    once.path.create $ONCE_SCENARIO/$scenarioPath/$scenarioName.$scenarioVersion

  else 
    warn.log "no scenarioPath provided"
  fi
  
  RETURN=$1
}

once.scenario.map.save() 
{

  once.scenario.map.load

  cd $ONCE_DEFAULT_SCENARIO
  {
    for (( i=0; $i < "${#SCENARIO_MAP_KEYS[@]}"; i+=1 )); do
      echo  SCENARIO_MAP_KEYS[$i]=${SCENARIO_MAP_KEYS[$i]}
      echo  SCENARIO_MAP_VERSION[$i]=${SCENARIO_MAP_VERSION[$i]}
      echo  SCENARIO_MAP_DC_NAME[$i]=${SCENARIO_MAP_DC_NAME[$i]}
      echo  SCENARIO_MAP_DI_NAME[$i]=${SCENARIO_MAP_DI_NAME[$i]}
      echo  SCENARIO_MAP_VALUES[$i]=${SCENARIO_MAP_VALUES[$i]}
      echo  SCENARIO_MAP_BACKUP[$i]=${SCENARIO_MAP_BACKUP[$i]}
      echo
    done 
  } >scenario.map
}

once.scenario.map.list() 
{
  once.scenario.map.load
  cat $ONCE_DEFAULT_SCENARIO/scenario.map
}

once.scenario.map.edit() 
{
  once.scenario.map.load
  vim $ONCE_DEFAULT_SCENARIO/scenario.map
}

once.scenario.map.load() 
{
  if [ -f "$ONCE_DEFAULT_SCENARIO/scenario.map" ]; then
    source $ONCE_DEFAULT_SCENARIO/scenario.map
  else
    once.scenario.map.init
  fi
}
once.scenario.map.delete() 
{
  if [ -f "$ONCE_DEFAULT_SCENARIO/scenario.map" ]; then
    rm $ONCE_DEFAULT_SCENARIO/scenario.map
  fi
}

once.scenario.map.init() {
  #declare -a SCENARIO_MAP_KEYS
  #declare -a SCENARIO_MAP_VALUES

  SCENARIO_MAP_KEYS[0]=nginx
  SCENARIO_MAP_VERSION[0]="1.21.3"
  SCENARIO_MAP_DC_NAME[0]="nginx_proxy"
  SCENARIO_MAP_DI_NAME[0]="nginx:${SCENARIO_MAP_VERSION[0]}" 
  SCENARIO_MAP_VALUES[0]="/EAM/1_infrastructure/Docker/Nginx.v${SCENARIO_MAP_VERSION[0]}"


  SCENARIO_MAP_KEYS[1]=certbot
  SCENARIO_MAP_VERSION[1]="1.7.0"
  SCENARIO_MAP_DC_NAME[1]="certbot"
  SCENARIO_MAP_DI_NAME[1]="certbot:${SCENARIO_MAP_VERSION[1]}" 
  SCENARIO_MAP_VALUES[1]="/EAM/1_infrastructure/Docker/CertBot.v${SCENARIO_MAP_VERSION[1]}"

  SCENARIO_MAP_KEYS[2]=pg
  SCENARIO_MAP_VERSION[2]="12.2"
  SCENARIO_MAP_DC_NAME[2]="once-postgresql"
  SCENARIO_MAP_DI_NAME[2]="postgres:${SCENARIO_MAP_VERSION[2]}" 
  SCENARIO_MAP_VALUES[2]="/EAM/1_infrastructure/Once/latestServer/PostgreSQL.v${SCENARIO_MAP_VERSION[2]}"

  
  SCENARIO_MAP_KEYS[3]=pgadmin
  SCENARIO_MAP_VERSION[3]="4.18"
  SCENARIO_MAP_DC_NAME[3]="once-pgadmin"
  SCENARIO_MAP_DI_NAME[3]="pgadmin:${SCENARIO_MAP_VERSION[3]}" 
  SCENARIO_MAP_VALUES[3]="/EAM/1_infrastructure/Docker/pgAdmin.v${SCENARIO_MAP_VERSION[3]}" 
  
  SCENARIO_MAP_KEYS[4]=woda2local
  SCENARIO_MAP_VERSION[4]="4.3.0"
  SCENARIO_MAP_DC_NAME[4]="${SCENARIO_MAP_KEYS[4]}"
  SCENARIO_MAP_DI_NAME[4]="woda-nodejs:16.x" 
  SCENARIO_MAP_VALUES[4]="/EAM/2_systems/WODA2local.v${SCENARIO_MAP_VERSION[4]}" 

  SCENARIO_MAP_KEYS[10]=woda
  SCENARIO_MAP_VERSION[10]="4.3.0"
  SCENARIO_MAP_DC_NAME[10]="woda"
  SCENARIO_MAP_DI_NAME[10]="woda-nodejs:16.x" 
  SCENARIO_MAP_VALUES[10]="/EAM/2_systems/WODA.v${SCENARIO_MAP_VERSION[4]}" 
  SCENARIO_MAP_BACKUP[2]="/var/dev"

  SCENARIO_MAP_KEYS[5]=pgv
  SCENARIO_MAP_VERSION[5]="12.2"
  SCENARIO_MAP_DC_NAME[5]="once-postgresql"
  SCENARIO_MAP_DI_NAME[5]="postgres:${SCENARIO_MAP_VERSION[5]}" 
  SCENARIO_MAP_VALUES[5]="/EAM/1_infrastructure/Once/latestServer/PostgreSQL.volume.v${SCENARIO_MAP_VERSION[5]}" 
  SCENARIO_MAP_BACKUP[5]="/var/lib/postgresql/data"

  SCENARIO_MAP_KEYS[6]=psql
  SCENARIO_MAP_VERSION[6]="12.3"
  SCENARIO_MAP_DC_NAME[6]="snet-postgresql"
  SCENARIO_MAP_DI_NAME[6]="postgresql:${SCENARIO_MAP_VERSION[6]}" 
  SCENARIO_MAP_VALUES[6]="/EAM/1_infrastructure/Docker/PostgreSQL.v${SCENARIO_MAP_VERSION[6]}" 

  SCENARIO_MAP_KEYS[7]=structr
  SCENARIO_MAP_VERSION[7]="2.1.4"
  SCENARIO_MAP_DC_NAME[7]="once-structr-server"
  SCENARIO_MAP_DI_NAME[7]="structr:${SCENARIO_MAP_VERSION[7]}" 
  SCENARIO_MAP_VALUES[7]="/EAM/2_systems/Docker/StructrServer.v${SCENARIO_MAP_VERSION[7]}" 

  SCENARIO_MAP_KEYS[8]=keycloak
  SCENARIO_MAP_VERSION[8]="12.0.4"
  SCENARIO_MAP_DC_NAME[8]="snet-keycloak"
  SCENARIO_MAP_DI_NAME[8]="keycloak:${SCENARIO_MAP_VERSION[8]}" 
  SCENARIO_MAP_VALUES[8]="/EAM/1_infrastructure/Docker/Keycloak.v${SCENARIO_MAP_VERSION[8]}" 

  SCENARIO_MAP_KEYS[9]=jhipster
  SCENARIO_MAP_VERSION[9]="6.7.1"
  SCENARIO_MAP_DC_NAME[9]="snet-jhipster"
  SCENARIO_MAP_DI_NAME[9]="jhipster:${SCENARIO_MAP_VERSION[9]}" 
  SCENARIO_MAP_VALUES[9]="/EAM/2_systems/Docker/Jhipster.v${SCENARIO_MAP_VERSION[9]}" 

  #declare -a
}

function once.scenario.map() {
  local scenarioName=$1
  shift
  local create=$1
  shift
  if [ -z "$scenarioName" ] &&  [ "$scenarioName" = "$SELECTED_SCENARIO" ]; then
      echo Scenario $scenarioName in $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
      return 0
  fi

  once.scenario.map.load

  found="not found"
  let i=0
  for index in "${SCENARIO_MAP_KEYS[@]}"; do
    #echo looping ${SCENARIO_MAP_KEYS[$index]}  at $i
    if [ "$scenarioName" == "${SCENARIO_MAP_KEYS[$i]}" ]; then
      found=$i
      #echo found at $i
      break;
    fi
    let i++
  done

  if [ "$found" = "not found" ]; then
    warn.log "Scenario \"$scenarioName\" not found!!!"
    return 1
  else
  

    SELECTED_SCENARIO_NAME=${scenarioName}
    SELECTED_SCENARIO=${SCENARIO_MAP_VALUES[$found]}
    SELECTED_SCENARIO_VERSION=${SCENARIO_MAP_VERSION[$found]}
    SELECTED_SCENARIO_DC_NAME=${SCENARIO_MAP_DC_NAME[$found]}
    SELECTED_SCENARIO_DI_NAME=${SCENARIO_MAP_DI_NAME[$found]}
    SELECTED_SCENARIO_BACKUP=${SCENARIO_MAP_BACKUP[$found]}
    SELECTED_SCENARIO_PATH=$ONCE_SCENARIO$SELECTED_SCENARIO

    SELECTED_SCENARIO_CONTAINER_ID=$(docker ps | grep "$SELECTED_SCENARIO_DC_NAME" | tr -s ' ' | cut -d\  -f1)
    echo Select Scenario \'$scenarioName\' ID: $SELECTED_SCENARIO_CONTAINER_ID  Path:  ${SCENARIO_MAP_VALUES[$found]}
    

    if [ -n "$create" ]; then
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    else
      warn.log "Sceanrio does not exist: $ONCE_SCENARIO$SELECTED_SCENARIO"
    fi
    #ls -al
    RETURN=$1
  fi

}

once.scenario.delete()    # creates a Scenario directory in the current $ONCE_SCENARIO
{
  local scenarioPath=$1
  shift
  local assurance=$1
  shift

  if [ -n "$scenarioPath" ]; then
    tree -a $ONCE_SCENARIO/$scenarioPath
    if [ -z "$assurance" ]; then
      assurance=echo
      warn.log "second parameter has to be \"yes\" or it will only preview the deletion command"
    else
      unset assurance
    fi
    $assurance rm -r $ONCE_SCENARIO/$scenarioPath
  else 
    warn.log "no scenarioPath provided"
  fi
  
  RETURN=$1
}

once.scenario.check()     # prints out the current set scenario without changing it
{
  if [ -z "$ONCE_DEFAULT_SCENARIO" ]; then
    if [ -z "$SCENARIOS_DIR" ]; then
      SCENARIOS_DIR=$ONCE_REPO_PREFIX/EAMD.ucp/Scenarios
      ONCE_SCENARIO=$SCENARIOS_DIR/localhost
    fi
    console.log "Setting ONCE_DEFAULT_SCENARIO to: $SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/latestServer"
    export ONCE_DEFAULT_SCENARIO=$SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/latestServer
    console.log "Current ONCE_DEFAULT_SCENARIO                   is: $ONCE_DEFAULT_SCENARIO"
    console.log "        ONCE_SCENARIO                           is: $ONCE_SCENARIO"

    once.hibernate update
  else
    console.log "Current ONCE_DEFAULT_SCENARIO                   is: $ONCE_DEFAULT_SCENARIO"
    console.log "        ONCE_SCENARIO                           is: $ONCE_SCENARIO"
    
    warn.log " ONCE_DEFAULT_SCENARIO_DOCKER is deprecated: $ONCE_DEFAULT_SCENARIO_DOCKER"
  fi
}

once.scenario.fix()        # if the scenario is not correct you can force it to update with this command. First parameter is the optional domain e.g. test.wo-da.de
{
  once.scenario.check
  OLD_SCENARIO=$ONCE_DEFAULT_SCENARIO
  once.scenario.discover $1

  if [ -n "$SCENARIOS_DIR" ]; then
      ONCE_SCENARIO=$SCENARIOS_DIR/$(cat $OLD_SCENARIO/once.scenario)
  else
      ONCE_SCENARIO=$ONCE_REPO_PREFIX/EAMD.ucp/Scenarios/$(cat ./once.scenario)
  fi 
  stop.log    "NEW current ONCE_DEFAULT_SCENARIO is: $ONCE_DEFAULT_SCENARIO"
  console.log "                   ONCE_SCENARIO         is: $ONCE_SCENARIO"
  once.update.variables
  once.hibernate update
}

once.scenario.discover()             # forces re-discovery of the current environment and scenario configuration, but does not change settings (use scenario.fix to change settings) 
{
  once.cmd eamd
  #once.path

  cd $ONCE_DEFAULT_SCENARIO
  local hostname=$HOSTNAME
  if [ -n "$1" ]; then
    console.log "Setting hostname to: $1"
    hostname=$1
    shift
  fi
  debug.log h:$hostname- H:$HOSTNAME-
  #stepDebugger ON

  eamd call loop $hostname . reverse x log . r / save once.scenario
  ONCE_SCENARIO=$SCENARIOS_DIR/$(cat once.scenario)
  console.log "ONCE_SCENARIO=$ONCE_SCENARIO"
  ONCE_DOMAIN=$(find $ONCE_SCENARIO -type d -name CertBot -exec find {}/1.7.0/config -mindepth 1 -maxdepth 1 -type d \;)
  #console.log "-ONCE_DOMAIN=-$ONCE_DOMAIN-"
  if [ -n "$ONCE_DOMAIN" ]; then
    stop.log "found domain ONCE_DOMAIN=$ONCE_DOMAIN"
    eamd call loop $ONCE_DOMAIN / silent x result $startDir/.tmp.result.list.env
    . $startDir/.tmp.result.list.env
    ONCE_DOMAIN=$lastItem
    
    #ONCE_DEFAULT_SERVER=$ONCE_DOMAIN
    ONCE_DEFAULT_HOST=$ONCE_DOMAIN
    
    console.log "ONCE_DOMAIN=$ONCE_DOMAIN"
    eamd call loop $ONCE_DOMAIN . reverse x log . r / save once.domain
    ONCE_DOMAIN=$(cat once.domain)
    ONCE_SCENARIO=$ONCE_SCENARIO/vhosts/$ONCE_DOMAIN

    console.log "ONCE_SCENARIO=$ONCE_SCENARIO"
    rm once.scenario
    rm $startDir/.tmp.result.list.env
    rm once.domain
    tree -a $ONCE_DEFAULT_SCENARIO
  fi
  stop.log "new ONCE_SCENARIO=$ONCE_SCENARIO"
  ONCE_DEFAULT_SCENARIO=$ONCE_SCENARIO/EAM/1_infrastructure/Once/latestServer
  checkAndFix  "default ONCE_DEFAULT_SCENARIO location" "-d" "$ONCE_DEFAULT_SCENARIO" "once.path.create $ONCE_DEFAULT_SCENARIO"
  checkAndFix  "checking if .once.env link exist" "-L" "$ONCE_DEFAULT_SCENARIO/.once.env" "ln -s $ONCE_DEFAULT_SCENARIO/.once $ONCE_DEFAULT_SCENARIO/.once.env"
  
  #once.paths.reset
  #once.paths.save

}

function once.find()                 # finds all running node servers
{
  ps aux | grep Once
}

function once.check.installation()   # checks for a once installation in given path
{

  checkAndFix "exists $ONCE_REPO_PREFIX" "-d" "$ONCE_REPO_PREFIX" "once.path.create $ONCE_REPO_PREFIX"

  once.pm
  checkAndFix "make once alias $(which $0)" -L "$(dirname $(which $0))/once" "ln -s $(which $0) $(dirname $(which $0))/once" 
  once.cmd wget
  once.cmd curl
  once.cmd git
  once.cmd eamd

  once.stage ssh.init


  if [ -d $COMPONENTS_DIR ]; then
    console.log "Repository found at $COMPONENTS_DIR..."
    console.log "discover scenario..."
    once.stage scenario
    #once paths.reset paths.save
  else
    console.log "Repository NOT FOUND at $COMPONENTS_DIR..."
    once.stage repo.init

  fi
  
  once.stage state.installed
}

function once.state.installed()            # prints where the repository has been installed 
{

  #once.cmd nslookup dnsutils
  #once.cmd telnet inetutils-telnet
  export DEBIAN_FRONTEND=noninteractive
  apt install -y dnsutils
  apt install -y inetutils-telnet
  apt install -y inetutils-ping

  once.docker.install
  once.cmd npm

  console.log "Repository is installed at: $ONCE_REPO_PREFIX/$ONCE_REPO_NAME"

  once.v

  once.repo.checkout.scenarioBranch


  #once.stage server.start
  once.ca
  once.cu

  #already done outside manually
  #once.dc.create pg
      #once.deprecated.docker.postgresql.createdc
      #once.deprecated.docker.postgresql.start

  apt-get install sudo
  #once.user.developer
  #chown developer:dev /var/run
  #chown developer:dev /var/run/docker.sock

  #docker network connect once-postgresql $HOSTNAME
  cp /root/scripts/templates/.bashrc .bashrc


  #cp $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts/templates/.bashrc ~/.bashrc
  #once.user.rc.fix
  #once.completion.install

  #set password for developer with
  # root> passwd developer (default is dev)
  once.status

  unset ONCE_TMP_DURING_INSTALL

  console.log "Once is installed and ready for: once start    ....now testing"
  #once.stage test
  echo once test
  
}

function once.bind.docker() 
{
  if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "in docker....making everything localhost in docker"
    export ONCE_DIRECT_HTTPS_URL=https://localhost:8443
    export ONCE_DEFAULT_URL=https://localhost:8443
    export ONCE_DEFAULT_HOST=localhost
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@once-postgresql:5432/oncestore
    export ONCE_DEFAULT_UDE_STORE=https://localhost:8443

    export ONCE_STRUCTR_SERVER=https://test.wo-da.de:8083
    once.hibernate update
  fi
    RETURN=$1
}

function once.bind.local() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "in docker....making everything localhost"
    export ONCE_DIRECT_HTTPS_URL=https://localhost:8443
    export ONCE_DEFAULT_UDE_STORE=https://localhost:8443
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@localhost:5433/oncestore
    export ONCE_DEFAULT_URL=https://localhost:8443
    export ONCE_DEFAULT_HOST=localhost
    
    export ONCE_STRUCTR_SERVER=https://test.wo-da.de:8083
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind() # host port protocol
{
  local host=$1
  shift
  local port=$1
  shift
  local protocol=$1
  shift

  if [ -z "$port" ]; then
    port="8443"
  fi

  if [ -z "$protocol" ]; then
    protocol="https://"
  fi

  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "binding everything to $protocol$host:$port"
    export ONCE_DIRECT_HTTPS_URL="$protocol$host:$port"
    export ONCE_DEFAULT_UDE_STORE="$protocol$host:$port"
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@$host:5433/oncestore
    export ONCE_DEFAULT_HOST="$host"

    
    export ONCE_STRUCTR_SERVER=https://$host:8083
    once.hibernate update
  #fi
    RETURN=$1
}


function once.bind.with.proxy() # host port protocol
{
  echo  binding $* 
  local host=$1
  shift
  local port=$1
  shift
  local protocol=$1
  shift

  if [ -z "$port" ]; then
    port="8443"
  fi

  if [ -z "$protocol" ]; then
    protocol="https://"
  fi

  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "binding everything to $protocol$host:$port with proxy $protocol$host"
    export ONCE_DIRECT_HTTPS_URL="$protocol$host:$port"

    export ONCE_DEFAULT_URL="$protocol$host"
    export ONCE_DEFAULT_UDE_STORE="$protocol$host"
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@once-postgresql:5432/oncestore
    export ONCE_DEFAULT_HOST="$host"

    export ONCE_DEFAULT_KEYCLOAK_SERVER='{ "realm": "master", "clientId": "shifternetzwerk", "testClient": { "client_id": "mochaAPI", "client_secret": "df37971a-f098-4310-8a62-b238b15c7b35" , "mocha1id": "42b8c48b-34d6-4a33-8c93-5e3782c05a48", "mocha2id": "ccfff6f6-7764-4111-98f3-6bf68d8e4b26", "mocha3id": "92746ce6-d5ce-4127-9e45-30fef19cf7a6" }, "url": "'$protocol$host'/auth"}'
    export ONCE_REVERSE_PROXY_CONFIG='[["auth","'$host'"],["snet","'$host'"],["structr","'$host'"]]'  
    
    export ONCE_STRUCTR_SERVER=https://test.wo-da.de:8083
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind.completion() {
    echo $HOSTNAME localhost test.wo-da.de dev.wo-da.de prod.wo-da.de wo-da.de | grep "^$1"
}

function once.bind.structr.local() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "in docker....making everything localhost"
    export ONCE_DIRECT_HTTPS_URL=https://localhost:8443
    export ONCE_DEFAULT_UDE_STORE=https://localhost:8443
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@localhost:5433/oncestore
    export ONCE_DEFAULT_URL=https://localhost:8443
    
    export ONCE_STRUCTR_SERVER=https://localhost:8082
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind.structr.test() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "in docker....making everything localhost"

    export ONCE_STRUCTR_SERVER=https://test.wo-da.de:8083
    once.hibernate update
  #fi
    RETURN=$1
}


function once.bind.structr.proxy.local() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "in docker....making everything localhost"
    export ONCE_DIRECT_HTTPS_URL=https://localhost:8443
    export ONCE_DEFAULT_UDE_STORE=https://localhost:8443
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@localhost:5433/oncestore
    export ONCE_DEFAULT_URL=https://localhost:8443
    
    export ONCE_REVERSE_PROXY_CONFIG='[["auth","test.wo-da.de"],["snet","test.wo-da.de"],["structr","localhost:8082"]]'
    export ONCE_STRUCTR_SERVER=http://localhost:5002
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind.structr.proxy.http.test() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "for localhost only....using http reverse proxy for structr on localhost"
    export ONCE_DIRECT_HTTPS_URL=https://localhost:8443
    export ONCE_DEFAULT_UDE_STORE=https://localhost:8443
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@localhost:5433/oncestore
    export ONCE_DEFAULT_URL=https://localhost:8443
    
    export ONCE_REVERSE_PROXY_CONFIG='[["auth","test.wo-da.de"],["snet","test.wo-da.de"],["structr","test.wo-da.de"]]'
    export ONCE_STRUCTR_SERVER=http://localhost:5002
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind.structr.proxy.https.test() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "for localhost only....using https reverse proxy for structr on test.wo-da.de"
    export ONCE_DIRECT_HTTPS_URL=https://localhost:8443
    export ONCE_DEFAULT_UDE_STORE=https://localhost:8443
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@localhost:5433/oncestore
    export ONCE_DEFAULT_URL=https://localhost:8443
    
    export ONCE_REVERSE_PROXY_CONFIG='[["auth","test.wo-da.de"],["snet","test.wo-da.de"],["structr","test.wo-da.de"]]'
    export ONCE_STRUCTR_SERVER=https://localhost:5005
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind.Q.test() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "for localhost only....using https reverse proxy for structr on test.wo-da.de and auth for woda.q-nnect.com"
    export ONCE_DIRECT_HTTPS_URL=https://test.wo-da.de:8443
    export ONCE_DEFAULT_UDE_STORE=https://test.wo-da.de:8443
    
    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@localhost:5433/oncestore
    export ONCE_DEFAULT_URL=https://localhost:8443
    
    export ONCE_REVERSE_PROXY_CONFIG='[["auth","woda.q-nnect.com"],["snet","test.wo-da.de"],["structr","test.wo-da.de"]]'
    export ONCE_STRUCTR_SERVER=https://localhost:5005
    once.hibernate update
  #fi
    RETURN=$1
}

function once.bind.test() 
{
  #if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    warn.log "in docker....binidng DB and Structr on test.wo-da.de"
    export ONCE_DIRECT_HTTPS_URL=https://test.wo-da.de:8443
    export ONCE_DEFAULT_URL=https://test.wo-da.de

    export ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@test.wo-da.de:5433/oncestore
    export ONCE_DEFAULT_UDE_STORE=https://test.wo-da.de
    export ONCE_DEFAULT_HOST=test.wo-da.de


    export ONCE_STRUCTR_SERVER=https://test.wo-da.de:8083
    once.hibernate update
  #fi
      RETURN=$1
}

once.server.config()
{
  once.$1
  shift
  #RETURN=$1
}

function once.server.config.completion()
{
  once.completion.discover $1 su #| sed 's/\(bind\.\)\(.*\)/\2/'
}

function once.state.build.successful() 
{
  console.log "BUILD successfull, not starting once"
}

function once.server.start()         # starts the once server if not already up and running
{
  stop.log "current state is: $ONCE_STATE"
  if [ "$ONCE_STATE" = "state.not.installed" ]; then
    once.init
  fi
  once.isInDocker
  console.log "once start in mode $ONCE_MODE with option $@"

  if [ "$ONCE_BUILD" = "BUILDING" ]; then
    unset ONCE_BUILD
    once.stage state.build.successful
    exit 0
  fi

  if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    if [ -f /.dockerenv ]; then
      once.server.start.inDocker "$@"
      return
    else
      once.server.start.docker
      return
    fi
  fi

  if [ "$ONCE_MODE" = "DOCKER" ]; then
    once.server.start.docker
    return
  fi

  if [ "$ONCE_MODE" = "LOCAL" ]; then
    once.server.start.local "$@"
    return
  fi

  err.log "UNKNOWN ONCE_MODE: $ONCE_MODE"
  
}

function once.server.start.local()
{
  if [ "$1" = "start" ]; then 
    shift
    RETURN=$1
  fi

  if [ -n "$ONCE_SERVER_PID" ]; then
    if [ "$1" != "new" ]; then  
      console.log "Server is already up: $ONCE_SERVER_PID";
      once.hibernate update
      once.cat
      shift
      RETURN=$1
      return 
    fi
  fi 
  once.cmd npm

  cd $ONCE_DIR
  console.log "Starting Once Server in: $(pwd)"
  console.log "   option: $@"

  if [ "$1" != "fast" ]; then 
    npm update
  else 
    shift
  fi
  once.cmd wget
  # once.cu    
  # npm install dotenv -g
  nohup node -r dotenv/config src/js/Once.class.js dotenv_config_path=$ONCE_DEFAULT_SCENARIO/.once.env &>$ONCE_DEFAULT_SCENARIO/once.log &

  ONCE_STATE=state
  ONCE_SERVER_PID="$ONCE_SERVER_PID $!"
  once.hibernate update

  console.log "Once Server up as PID: $ONCE_SERVER_PID"
  RETURN=$1
}
function once.server.start.docker()
{
  #cd $COMPONENTS_DIR/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Nodejs/14
  #console.log "Starting Once Server in: $(pwd)"
  #runDocker
  once.deprecated.docker.woda.start
}
function once.server.start.inDocker()
{
  once.server.start.local "$@"
}

function once.server.stop()          # stops the server 
{
  once.isInDocker
  console.log "once stop in mode $ONCE_MODE"

  if [ "$ONCE_MODE" = "IN_DOCKER" ]; then
    if [ -f /.dockerenv ]; then
      once.server.stop.process 
      return
    else
      once.server.stop.docker
      return
    fi
  fi

  if [ "$ONCE_MODE" = "DOCKER" ]; then
    once.server.stop.docker
    return
  fi

  if [ "$ONCE_MODE" = "LOCAL" ]; then
    once.server.stop.process $@
    return
  fi

  err.log "UNKNOWN ONCE_MODE: $ONCE_MODE"


}

function once.server.stop.docker()   
{
  #cd $COMPONENTS_DIR/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Nodejs/14
  #console.log "stoping Once Server Docker Container from: $(pwd)"
  #docker-compose stop
  once.deprecated.docker.woda.stop
}

function once.server.stop.process()          # stops the server 
{
  if [ -n "$1" ]; then
    console.log "Setting Once Server PID to: $1"
    ONCE_SERVER_PID=$1
  fi
  
  if [ -n "$ONCE_SERVER_PID" ]; then
    console.log "Stopping Once Server with PID: $ONCE_SERVER_PID"
    
    kill -SIGTERM $ONCE_SERVER_PID
    
    ONCE_STATE=check.installation
    ONCE_SERVER_PID=
    once.hibernate update
  else
    warn.log  "no Server PID found: $ONCE_SERVER_PID"
    once.find
    docker ps
  fi
}
once.state()                # lists the current state of the once server and the current configuration alias to once state 
{

  once.version
  console.log "read state from ONCE_DEFAULT_SCENARIO: $ONCE_DEFAULT_SCENARIO
  "
  cat $ONCE_DEFAULT_SCENARIO/.once
  once.config.list

  if [ -n "$ONCE_SERVER_PID" ]; then
    console.log "EOF

  Once Server is up.
    Stop      it with: $0 stop <?PID:$ONCE_SERVER_PID>
    Log       it with: $0 log
    Get Log file with: $0 cat
    "
  else
    console.log "EOF

  Once Server is down...
    ";
  fi
}

once.states()
{
  declare -ar ONCE_STATES='(\
  [0]="init" \ 
  [1]="user" \
  [2]="user.installation" \
  [2]="user.installation.checked" \
  [3]="user.not.installed" \
  [4]="user.repo.installed" \
  [5]="user.installed" \
  [11]="root" \
  [12]="root.installation" \
  [12]="root.installation.checked" \
  [13]="root.not.installed" \
  [14]="root.repo.installed" \
  [15]="root.installed" \
  [20]="scenario.updated" \
  [21]="db.started" \
  [22]="once.tested" \
  [23]="once.test.stoped" \
  [24]="once.started" \
  [25]="once.stoped" \
  [26]="db.stoped" \
  )' 
}

once.server()
{
    if [ -z "$1" ]; then 
        tree -L 1 $ONCE_DIR/..
        return
    fi

    cd $ONCE_DIR/..
    local version=$1
    if [ -d $version ]; then
      checkAndFix "remove latestServer"  "! -L" "latestServer" "rm latestServer"
      checkAndFix "set    latestServer"  "-d" "latestServer" "ln -s $version latestServer"
      ONCE_DIR=$COMPONENTS_DIR/tla/EAM/layer1/Thinglish/Once/$version
      once.update.variables
      tree -L 1 $ONCE_DIR/..
      once.stage done
    else
      err.log "Once Version $version not found"
    fi

}

once.client()
{
    if [ -z "$1" ]; then 
        tree -L 1 $ONCE_DIR/..
        return
    fi

    cd $ONCE_DIR/..
    local version=$1
    if [ -d $version ]; then
      checkAndFix "remove latestClient"  "! -L" "latestClient" "rm latestClient"
      checkAndFix "set    latestClient"  "-d" "latestClient" "ln -s $version latestClient"
      tree -L 1 $ONCE_DIR/..
      once.stage done
    else
      err.log "Once Version $version not found"
    fi

}

function once.check.privileges()     # checks the administrative rights of the current once instance 
{

  ONCE_TMP_DURING_INSTALL="true"


  if [ "$USERHOME" != "/root" ]; then
    once.stage state.user
  else
    once.stage state.root
  fi
  once.update.variables
  once.hibernate update

  warn.log "check.priviledges done: stahe to $ONCE_STATE"
  once.stage
  warn.log "END of check.priviledges"
}

function once.state.root()                 # populates the environmental variables with root administrative rights 
{
    ONCE_PRIVILEGE=root
    ONCE_REPO_PREFIX=/var/dev
    ONCE_STATE=root.installation
}

function once.root.installation()    # installs the repo as root user
{
  once.check.installation
}

function once.state.user()                 # populates the environmental variables with user administrative rights 
{
    ONCE_PRIVILEGE=user
    ONCE_REPO_PREFIX=$USERHOME/dev
    ONCE_STATE=user.installation
    if [ -z "ONCE_SUDO" ]; then 
      ONCE_SUDO="sudo"
    fi
    ONCE_PM="$ONCE_SUDO $ONCE_PM"

}

function once.user.developer() # creates the user developer:dev with th discovered UID and GID from the host user
{
  if [ ! -d $REPO_DIR ]; then
    once.user.discover
    case $custom_uid in
      root)
        warn.log "$REPO_DIR is owned by root"
        
        groupadd dev
        once.user.create developer
        $ONCE_SUDO usermod -a -G dev developer
        once.user.developer.fix.rights
        ;;
      developer)
        warn.log "user developer already exists"
        ;;
      ''|*[!0-9]*)
        warn.log "custom_uid is not a number: uid=$custom_uid gid=$custom_gid"
        ;;
      *)
        groupadd dev
        once.user.create developer $custom_uid $custom_gid
        ;;
    esac
  else
    warn.log "Repository does not exist: $REPO_DIR"
  fi
}

function once.user.developer.fix.rights()
{
        chown developer:dev /var/run
        chown developer:dev /var/run/docker.sock
        chown -Rv developer:dev $ONCE_REPO_PREFIX/EAMD.ucp
}

once.user.init()    # sets up the .bashrc and scripts of user $1  
{
    local name=$1
    shift
    local group=$1
    shift

    if [ -z "$name" ]; then
      name=$(whoami)
    fi

    if [ -d $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts ]; then
      $ONCE_SUDO usermod -a -G sudo $name
      #useradd -g dev $name 
      cd /home/$name
      $ONCE_SUDO cp /root/.bashrc /home/$name/.bashrc
      $ONCE_SUDO chown $name:$name /home/$name/.bashrc
      
      $ONCE_SUDO cp /root/.once /home/$name/.once
      $ONCE_SUDO chown $name:$name /home/$name/.once

      ln -s $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts
      $ONCE_SUDO chown -h $name:$name /home/$name/scripts
        $ONCE_SUDO cp /root/.once /home/$name/.once
      if [ -d /home/$name/.ssh ]; then
        if [ "$name" = "develo[er" ]; then
          $ONCE_SUDO cp -r /home/$name/scripts/templates/developking.ssh /home/$name/.ssh
          $ONCE_SUDO chown $name:$name /home/$name/.ssh
        else
          warn.log "use   scripts/ssh.init  to create keys"
        fi
      fi

    else
      local userHome="/home/$name"

      if [ ! -d "$userHome/scripts" ]; then
          warn.log "$userHome/scripts does not exist..."
          console.log "creating $userHome/scripts"
          #git clone cerulean.it$ONCE_REPO_PREFIX/GIT/scripts.git
          once.cmd wget
          once.cmd unzip
          rm scripts.zip*
          debug.log "wget http://test.wo-da.de/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts.zip"
          wget http://test.wo-da.de/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts.zip
          unzip scripts.zip -d $userHome/
          chmod +x -R $userHome/scripts
          #cp $eamdDir/eamd $userHome/scripts
          # chown -R $user:dev $userHome
          # chown -R $user:dev $userHome/.*
          chown -R $name:dev $userHome/scripts/*
          chsh -s $(which bash) $name
      else
          cd $userHome/scripts
          checkCommand git
          git pull
          #git clone $defaultGitUser@$defaultGitServer:/home/dev/GIT/scripts.git
      fi



      if [ ! -w "$userHome/.bashrc" ]; then
          warn.log "$userHome/.bashrc does not exist..."
          console.log "creating it..."
          cp $userHome/scripts/templates/.bashrc $userHome
          if [ ! -w "$userHome/.profile" ]; then
              #touch $userHome/.profile
              ln -s .bashrc .profile
              chmod +x $userHome/.bashrc
          fi
          #link for mac osx
          ln -s .bashrc .bash_profile
          . $userHome/.bashrc
      #else
          # if [ -w $userHome/scripts/templates/bashrc_addonTemplate ]; then
          #     #console.log "improving .bashrc"
          #     #cat $userHome/scripts/templates/bashrc_addonTemplate >>$userHome/.bashrc
          #     #rm $userHome/scripts/templates/bashrc_addonTemplate
          #     warn.log "prevented bash enhancement"
          # else 
          #     console.log ".bashrc already improved"
          # fi
      fi
    fi
    RETURN=$1
}

function once.user.create()                   # expets "name <uid gid>" and creates a new user with home dir
{

  local name=$1
  local custom_uid=
  local custom_gid=
  shift
  if [ -n "$1" ]; then
    custom_uid=$1
    shift
  fi
  if [ -n "$1" ]; then
    custom_gid=$1
    shift
  fi

  if [ -d $REPO_DIR ]; then
    warn.log "Repository does not exist: $REPO_DIR"
  fi

  if [ -n "$custom_uid" ]; then
    $ONCE_SUDO useradd -m $name -u$custom_uid -g$custom_gid -s /bin/bash
  else
    $ONCE_SUDO useradd -m $name -s /bin/bash
  fi
  $ONCE_SUDO usermod -aG sudo $name
  useradd -g dev $name 
  once.user.init $name
  

  RETURN=$1

}

function once.user.discover()
{
  cd $REPO_DIR
  local filename=check.user.txt
  touch $filename
  # for mac
  #  custom_gid=$(ls -al $REPO_DIR/$filename | cut -f 4 -d ' ')
  #  custom_gid=$(ls -al $REPO_DIR/$filename | cut -f 6 -d ' ')
  # for ubuntu
  custom_uid=$(ls -al $REPO_DIR/$filename | cut -f 3 -d ' ')
  custom_gid=$(ls -al $REPO_DIR/$filename | cut -f 4 -d ' ')

  console.log "discoverd UID: $custom_uid   and GID: $custom_gid"
  #rm $filename
}

function once.user.installation()    # installs the repo as a user
{
  if [ -d $ONCE_REPO_PREFIX ]; then
      ONCE_REPO_PREFIX=/var/dev
  fi
  once.check.installation
}


function once.group.discover.id()   # finds the custom_gid for a group name
{
  local groupname=$1
  shift
  local ginfo=$( getent group $groupname )
  console.log "found group info: $ginfo"
  custom_gid=$(cut -d: -f3 <(echo $ginfo))
  console.log "discovered custom_gid=$custom_gid"
  RETURN=$1
}

# function once.group.discover.id()   # finds the custom_gid for a group name
# {
#   local groupname=$1
#   shift
#   once.group.discover.id $groupname

#   RETURN=$1
# }

function once.path.create()          # creates respective paths
{

    console.log " function ${FUNCNAME[0]}($1) $@"


    if [[ "$1" = /* ]]; then
        cd "/"
    fi

    path=""
    console.log "creating path in $(pwd)"

    for current in ${1//// }; do

        if [ -z "$path" ]; then
            path=$current
        else
            path=$path/$current
        fi
        debug.log "checking path: $path"

        once.createDir $path
    done
}

function once.createDir()            # creates respective directory requested in parameter 
{

    local current=$1
    if [ ! -d $current ]; then
        debug.log "$current does not exist: creating it..."
        mkdir -p $current
    fi
}

function once.ssh.init() 
{
  once.paths.reset
  rm scripts.zip*
  
  eamd v
  #stepDebugger ON

  
  if [ ! "$?" = "0" ]; then
    warn.log "exitiong with code $?"
    exit $?
  fi
  
  if [ ! -f "~/.ssh/id_rsa" ]; then
    eamd oinit ssh
  fi
}
once.ssh.set.config.host()
{ 
  export ONCE_SSH_CONFIG_HOST=$1
  once.hibernate update
  echo "To apply changes immediatly type:
  
  exit $ERROR_CODE_RECONFIG"
  #reconfigure
}

once.repo.init() {
  once.path.create $ONCE_REPO_PREFIX
  cd $ONCE_REPO_PREFIX

  if [ -d "$REPO_DIR/.git" ]; then
    git stash -u 
    git pull
  else
    if [ -d "$REPO_DIR" ]; then
      rm -Rf $REPO_DIR
      if [ -d "$REPO_DIR.delete" ]; then
        mv $REPO_DIR.delete $REPO_DIR
        once.repo.init
        return $?
      fi
    fi
    git clone -c core.symlinks=true git@bitbucket.org:donges/eamd.ucp.git EAMD.ucp
  fi
  tree -L 2 $ONCE_REPO_PREFIX
  cd $REPO_DIR
  git status
  once.scenario.fix
}

once.repo.checkout.scenarioBranch() {
  cd $REPO_DIR
  git stash -u
  git checkout -t origin/$ONCE_SCENARIO_BRANCH
  #once.scenario.fix
}

once.deprecated.repo.init()            # forces reinitialisation 
{

  console.log "initialize Repository in $ONCE_REPO_PREFIX"
  cd $ONCE_REPO_PREFIX
  #checkAndFix  "default $ONCE_REPO_PREFIX Repository location" "-d" "$ONCE_REPO_PREFIX" "once path.create $ONCE_REPO_PREFIX"
  #checkAndFix  "default $ONCE_REPO_NAME Repository location" "-d" "$COMPONENTS_DIR" "once path.create $COMPONENTS_DIR"
  #checkAndFix  "default $ONCE_REPO_NAME Repository location" "-d" "$COMPONENTS_DIR" "once path.create $COMPONENTS_DIR"
  #checkAndFix  "default ONCE_DEFAULT_SCENARIO location" "-d" "$ONCE_DEFAULT_SCENARIO" "once path.create $ONCE_DEFAULT_SCENARIO"

  eamd oinit components

  tree -L 2 $ONCE_REPO_PREFIX
  stop.log "after clone"

  mv $ONCE_REPO_PREFIX/Backup.$ONCE_REPO_NAME/$ONCE_REPO_SCENARIOS $ONCE_REPO_PREFIX/$ONCE_REPO_NAME.previous
  rmdir $ONCE_REPO_PREFIX/$ONCE_REPO_NAME
  mv $ONCE_REPO_PREFIX/$ONCE_REPO_NAME.previous $ONCE_REPO_PREFIX/$ONCE_REPO_NAME
  rm ~/scripts/eamd
  
  cd $ONCE_REPO_PREFIX/$ONCE_REPO_NAME
  git config --global user.email "freemiumuser@example.com"
  git config --global user.name "freemium user"
  git stash -u 
  git checkout -t origin/$ONCE_SCENARIO_BRANCH
  # mv $ONCE_REPO_PREFIX/$ONCE_REPO_NAME/Scenarios/localhost/ $ONCE_REPO_PREFIX/EAMD.backup/
  checkAndFix  "default ONCE_DEFAULT_SCENARIO location" "-d" "$ONCE_LOAD_DIR" "once.path.create $ONCE_LOAD_DIR"
  # stop.log "fix /Scenarios/localhost"
  # mv $ONCE_REPO_PREFIX/EAMD.backup/ $ONCE_REPO_PREFIX/$ONCE_REPO_NAME/Scenarios/
  # rmdir $ONCE_REPO_PREFIX/Backup.$ONCE_REPO_NAME


  if [ "$ONCE_PRIVILEGE" = "root" ]; then
    console.log "root privileges detected...: fixing group rights on repository"
    chown -R $USER:dev $ONCE_REPO_PREFIX
    chmod -R g+wx $ONCE_REPO_PREFIX
    ls -alF $ONCE_REPO_PREFIX
    console.log "    done"
  fi
  
  once.stage scenario.fix
}

once.log()                  # opens the once log file and continues monitoring 
{

  tail -f $ONCE_DEFAULT_SCENARIO/once.log
  once.done
}

once.cat()                  # prints the current once log file to the console and exits 
{

      cat $ONCE_DEFAULT_SCENARIO/once.log
      once.done
}
once.status()               # lists the current state of the once server and the current configuration alias to once state 
{

  once.state "$@"
}

once.stop()                 # stops the server... if $ONCE_PID is wrong it can be overwritten by specifying the optional PID parameter  
{

  once.server.stop "$@"
}

function once.list.www()             # tries to find domain configurations on the current server location 
{

  #tree -dL 2 /var/www
  #find $SCENARIOS_DIR -type d -name CertBot -exec tree -d {}/1.7.0/config \;
  console.log $HOSTNAME
  find $SCENARIOS_DIR -type d -name CertBot -exec find {}/1.7.0/config -mindepth 1 -maxdepth 1 -type d  \;
  once.done
}

once.path()                 # sets the path to the scripts to be loaded by once as well the sources of the $ONCE_ environment variables  
{

  checkAndFix  "default ONCE_LOAD_DIR location" "-d" "$ONCE_LOAD_DIR" "once.path.create $ONCE_LOAD_DIR"
  #once.cmd eamd
  if [ -z "$ONCE_PATHS" ]; then 
    stop.log "about to reset path"
    once.paths.reset

    console.log "exported PATH: $PATH
    make sure you called this command as ". $this path"
    "

    ONCE_PATHS=$ONCE_DEFAULT_SCENARIO/paths
    once.user.rc.fix
    ONCE_PATHS=$ONCE_DEFAULT_SCENARIO/paths
    hash -r ## rescan PATH
    NEW=" entering $ONCE_SHELL"

    once.hibernate update
  else
    console.log "PATH will be loaded from $ONCE_PATHS"
    console.log "current PATH=$PATH"
  fi

  #once.done
}

function once.user.rc.fix() 
{
    checkAndFix "set ONCE_SHELL_RC: $ONCE_SHELL_RC" "-n" "$ONCE_SHELL_RC" "export ONCE_SHELL_RC=$HOME/.$(basename $SHELL)rc"
    
    echo "
    echo load path configuration for once:
    source ~/.once
 
    #cat ~/.once
    ONCE_PATHS=$ONCE_DEFAULT_SCENARIO/paths
    echo ' 
    
    Welcome to Web 4.0
    
    '
    " >>$ONCE_SHELL_RC
}

function once.paths.reset()                # reset path 
{
    ONCE_PATHS=
    PATH=.:~/scripts:$ONCE_INITIAL_PATH:$ONCE_DEFAULT_SCENARIO/oosh/:\$ONCE_REPO_PREFIX/\$ONCE_REPO_NAME/\$ONCE_REPO_COMPONENTS/com/ceruleanCircle/EAM/1_infrastructure/OOSH/1.0.0/src/sh:$ONCE_LOAD_DIR:\$ONCE_REPO_PREFIX/\$ONCE_REPO_NAME/\$ONCE_REPO_COMPONENTS/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts
    export PATH
    console.log "reset path to: PATH=$PATH"
    once.update.variables
    once.hibernate update
}

once.clean()                # uninstalls once and removes the current .once configuration. Afterwards once.sh has to be used to reinstall
                            # removes all .once configurations from all scenarios
{

  rm ~/.once
  rm $ONCE_DEFAULT_SCENARIO/.once
  #mv $ONCE_DEFAULT_SCENARIO/paths $ONCE_DEFAULT_SCENARIO/paths.bak
  #rm ~/scripts/eamd
  local this=$0
  #checkAndFix "remove once alias $this" "! -L" "$(dirname $this)/once" "rm $(dirname $this)/once" 
  rm -Rf $ONCE_LOAD_DIR
  if [ "$1" = "all" ]; then
    console.log "force deleting $REPO_DIR.deleted"
    if [ -d  "$REPO_DIR.deleted" ]; then
      rm -Rf $REPO_DIR.deleted
    fi
    mv "$REPO_DIR" "$REPO_DIR.deleted"
    rm -Rf ~/.local
    rm -Rf $OOSH_PATH
    rm -Rf $CONFIG_PATH
    rm -Rf ~/scripts
    rm ~/once*
    rm ~/.bashrc*
    
  fi
  
  if [ "$1" = "remove" ]; then
    console.log "force cleaning all environments"
    find $SCENARIOS_DIR -name .once -print
    find $SCENARIOS_DIR -name .once -exec rm {} \;
    find $SCENARIOS_DIR -name paths -exec rm {} \;
  fi
  
  if [ ! "$1" = "up" ]; then 
    exit 0 
  fi
}

once.config()               # starts vim to edit the current .once config 
{
  once.cmd vim
  vim $ONCE_DEFAULT_SCENARIO/.once
  once.update.variables
  once.config.list

  once.unset
}

once.config.list()          # prints a list of configurations (COMPONENTS_DIR, REPO_DIR, SCENARIOS_DIR, ONCE_DIR, ONCE_DEFAULT_SCENARIO, ONCE_LOAD_DIR)
{
  echo COMPONENTS_DIR=$REPO_DIR/$ONCE_REPO_COMPONENTS
  echo REPO_DIR=$ONCE_REPO_PREFIX/$ONCE_REPO_NAME
  echo SCENARIOS_DIR=$REPO_DIR/$ONCE_REPO_SCENARIOS
  echo ONCE_DIR=$COMPONENTS_DIR/tla/EAM/layer1/Thinglish/Once/latestServer
  echo ONCE_DEFAULT_SCENARIO=$SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/latestServer
  echo ONCE_LOAD_DIR=$SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/latestServer/oosh
  echo PATH=$PATH
}

once.edit()                 # starts vim to edit the once script
{

  once.cmd vim
  vim $ONCE_DIR/src/sh/once.sh
}

once.code()                 # starts vim to edit the Once.class.js Kernel 
{

  once.cmd vim
  vim $ONCE_DIR/src/js/Once.class.sh
}

once.update.script.in.container()
{
  docker cp $ONCE_DIR/src/sh/once.sh woda:/var/dev/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh
}


once.update()               # updates a git pull on the repository to get all the newest versions
                            # updates fromBranch <?origin> updates the current branch from origin: e.g. once update fromBranch origin/test/sprint12
                            # updates cmd <command> updates the command 
{

  #set -x
  local command=$1
  if [ -z "$command" ]; then
    shift
  fi

  local branch=$1
  if [ -z "$branch" ]; then
    shift
  fi
  case $command in
    byIP)
      scp ~/scripts/once.sh root@$ONCE_DEFAULT_SSH_IP:/root
      ;;
    server)
      scp ~/scripts/once.sh root@$ONCE_DEFAULT_HOST:/root
      #scp ~/scripts/once.sh root@$ONCE_DEFAULT_HOST:$COMPONENTS_DIR/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh
      #scp ~/scripts/once.sh root@$ONCE_DEFAULT_HOST:$COMPONENTS_DIR/tla/EAM/layer1/Thinglish/Once/4.0.0/src/sh/once.sh
      #scp ~/scripts/once.sh root@$ONCE_DEFAULT_HOST:$SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/4.0.0/oosh/once
      ;;
    here)
      #set -x
      shift
      local url=$1
      if [ -z "$url" ]; then
        url=$ONCE_LOCAL_SERVER
      fi
      if [ -z "$url" ]; then
        url=$ONCE_DEFAULT_URL
      fi
      rm ./once.sh
      wget $url/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh
      chmod +x ./once.sh
      cp ./once.sh $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh
      #scp root@$ONCE_DEFAULT_HOST:/root/once.sh ./once.sh
      #pushd $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh
      rm $OOSH_PATH
      rm ~/once
      exit 0
      ;;
    root)
      scp root@$ONCE_DEFAULT_SSH_IP:/root/once.sh ~/scripts/once.sh
      ;;
    fromBranch)
      once.update.fromBranch $branch 
      set +x
      exit 0
      ;;
    cmd)
      rm $(which $branch)
      once.cmd $branch
      ;;
    *)
      #once.cmd once
      cd $REPO_DIR
      currentBranch=$(git rev-parse --abbrev-ref HEAD)
      if [ "$ONCE_LATEST_BRANCH" = "$currentBranch" ]; then
        console.log "once update by: git pull"
        git pull
      else
        console.log "once update by: git merge origin/$ONCE_LATEST_BRANCH"

        once.update.fromBranch $ONCE_LATEST_BRANCH
      fi
      ;;
  esac
  
  set +x
  RETURN=$1
  once.done
}

function once.update.fromBranch()
{ 
      # @TODO double check if ONCE_SCENARIO_BRANCH contains the word Scenario
      local branch=$1
      once.cmd git
      shift
      cd $REPO_DIR
      git pull
      #git reset HEAD --hard
      #git clean -fdx
      git stash -u save once.update $(date)
      echo execute: git merge origin/$branch
      git merge origin/$branch
      # @TODO check SCENARIO_BRANCH ist nicht der gleiche wie $1 (LATEST_BRANCH)

      #git push
      once.stage done
} 

function  once.done()                 # finalising script execution in a clean process
{
	ONCE_STATE=state
  once.hibernate update
  console.log "once.sh: done $NEW"
  if [ -n "$NEW" ]; then
    cd ~
    scripts/once.sh links.fix
    $ONCE_REPO_PREFIX/$ONCE_REPO_NAME/$ONCE_REPO_COMPONENTS/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts/once.sh links.fix
    #clear
    NEW=
    $ONCE_SHELL -c ". ~/.bashrc; once status; $SHELL"
  fi
  exit 0
}

function once.i() 
{
  once.interactive "$@"
}
function once.interactive() {
  stepDebugger ON
  RETURN=$1
}

once.env()                  # lists the current $PATH paths on the screen 
{
  once cmd vim
  vim ~/.once
  RETURN=$1
}

once.paths.save()           # saves the current $PATH into the file in $ONCE_DEFAULT_SCENARIO/paths 
{
  cd $ONCE_DEFAULT_SCENARIO
  rm paths
  eamd call loop $PATH : call echo "paths"
}

once.paths.list()           # printing list of paths 
{
  cat $ONCE_DEFAULT_SCENARIO/paths
}

once.paths.edit()           # manually edit paths with vim
{
  vim $ONCE_DEFAULT_SCENARIO/paths
}

once.paths.load()           # loading all paths
{
    if [ ! -f $ONCE_DEFAULT_SCENARIO/paths ]; then
      console.log "$ONCE_DEFAULT_SCENARIO/paths not found!!!"
      once.paths.reset
      once.paths.save
      once.scenario
      return
    fi

    PATH=
    while read line; do
      if [ -n "$PATH" ]; then
        PATH=$PATH:$line
      else
        PATH=$line
      fi
    done <$ONCE_DEFAULT_SCENARIO/paths
    export PATH
    echo $PATH
}


function once.mv()                   # to be deleted: moves the Repo prefix...just a test 
{

  export REPO_PREFIX_UNDO=$ONCE_REPO_PREFIX
  if [ -n "$1" ]; then
    ONCE_REPO_PREFIX=$1
  fi
  once.update.variables
  once.config.list
  echo
  echo REPO_PREFIX_UNDO=$REPO_PREFIX_UNDO
  echo ONCE_REPO_PREFIX=$ONCE_REPO_PREFIX
  cat $ONCE_DEFAULT_SCENARIO/.once | sed "s/$(echo "$REPO_PREFIX_UNDO" | sed 's/\//\\\//g')/$(echo "$ONCE_REPO_PREFIX" | sed 's/\//\\\//g')/" >$ONCE_DEFAULT_SCENARIO/.once

  once.unset
}

once.links.fix()            # checks that the once and once.sh are links to the latest files after repo.init
{
  local DIR=$(dirname $This)
  if [ -z "$1" ]; then
  
    if [ "$DIR" = "." ]; then
      DIR=$startDir
    fi

    if [ "$DIR" = "$ONCE_DIR/src/sh" ]; then
      DIR=/usr/local/sbin
    fi
  else
    DIR="$1"
    console.log "fixing links in: $DIR"
  fi

  if [ "$DIR" = "/usr/local/sbin" ]; then
    console.log "once not yet installed but mapped to /usr/local/sbin  ...  $This ... $(dirname $This)... nothing changed!"
  else
    checkAndFix "make once.sh a live link into the repository $This" -L "$(dirname $This)/once.sh" "links.fix" 
    once.links

    links.fix
  fi

}
function links.fix()        # checks that the once and once.sh are links to the latest files after repo.init
{
  local DIR=$(dirname $This)
  if [ "$DIR" = "$ONCE_DIR/src/sh" ]; then
    err.log "Cannot fix links in $DIR"
    return
  fi
  if [ "$DIR" = "/usr/local/sbin" ]; then
    DIR="~/scripts"
  fi
  
  warn.log "fixing links in $DIR"
  rm $OOSH_PATH
  rm $DIR/once*
  rm $DIR/eamd*
  rm $DIR/debug*
  rm $ONCE_REPO_PREFIX/EAMD.ucp/Scenarios/localhost/EAM/1_infrastructure/Once/latestServer/oosh/eamd*
  ln -s $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAMD/UcpComponentSupport/1.0.0/src/sh/eamd $ONCE_REPO_PREFIX/EAMD.ucp/Scenarios/localhost/EAM/1_infrastructure/Once/latestServer/oosh/eamd
  ln -s $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAMD/UcpComponentSupport/1.0.0/src/sh/eamd $DIR/eamd
  ln -s $ONCE_DIR/src/sh/once.sh $DIR/once.sh
  ln -s $ONCE_DIR/src/sh/debug $DIR/debug
  pushd .
  cd $DIR
  ln -s ./once.sh once
  popd
}

once.links()                  # lists the most important links
{
    local DIR=~/scripts
    which once
    ls -alF $DIR/once*
    which eamd
    ls -alF $DIR/eamd*
    which debug
    ls -alF $DIR/debug*
}

function once.links.replace() # replace the once links by a hardcopy of the latest version form the repo
{
  local DIR=$(dirname $This)
  if [ "$DIR" = "." ]; then
    DIR=$startDir
  fi

  if [ "$DIR" = "$ONCE_DIR/src/sh" ]; then
    DIR=/usr/local/sbin
  fi

  if [ "$DIR" = "/usr/local/sbin" ]; then
    console.log "once not yet installed but mapped to /usr/local/sbin  ...  $This ... $(dirname $This) ... nothing changed!"
  else
    rm $DIR/once.sh
    cp $ONCE_DIR/src/sh/once.sh $DIR
    ls -alF $DIR/once*
  fi
}

once.structr.woda2local.start() {
  cd /Users/Shared/dev/EAMD.ucp/3rdPartyComponents/org/structr/StructrServer/woda2.local/docker/local/structr/1.0.0
  runDocker
}
once.structr.start() {
  cd /Users/Shared/dev/EAMD.ucp/3rdPartyComponents/org/structr/StructrServer/2.1.4/src/nginx_samba_structr
  docker-compose up
}

once.deprecated.docker.old(){

    if [ "$1" = "WODA" ] || [ "$1" = "woda" ]; then
      if [ "$2" = "server" ] || [ "$2" = "Server" ]; then
        if [ "$3" = "build" ] || [ "$3" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/
          ./buildDockerFileServer
        elif [ "$3" = "run" ] || [ "$3" = "RUN" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/
          ./runDockerFileServer
        else
          echo "Invalid Docker Command..."
        fi
      elif [ "$2" = "local" ] || [ "$2" = "LOCAL" ]; then
        if [ "$3" = "build" ] || [ "$3" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/
          ./buildDockerFileLocal
        elif [ "$3" = "run" ] || [ "$3" = "RUN" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/
          ./runDockerFileLocal
        else
          echo "Invalid Docker Command..."
        fi
      else
        echo "Invalid Docker Command..."
      fi
    elif [ "$1" = "nodejs" ] || [ "$1" = "Nodejs" ];then
        if [ "$2" = "build" ] || [ "$2" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Nodejs/14/
          ./buildDocker
        elif [ "$2" = "run" ] || [ "$2" = "RUN" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Nodejs/14/
          ./runDocker
        else
          echo "Invalid Docker Command..."
        fi
    elif [ "$1" = "structr" ] || [ "$1" = "Structr" ];then
        if [ "$2" = "build" ] || [ "$2" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Openjdk/8/Structr/2.1.4/
          ./buildDocker
        elif [ "$2" = "run" ] || [ "$2" = "RUN" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Openjdk/8/Structr/2.1.4/
          ./runDocker
        else
          echo "Invalid Docker Command..."
        fi
    elif [ "$1" = "open-ssl" ] || [ "$1" = "Open-SSL" ];then
        if [ "$2" = "build" ] || [ "$2" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Nginx/1.15/certbot/1.7.0/test.wo-da.de/
          ./buildDocker
        elif [ "$2" = "run" ] || [ "$2" = "RUN" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Nginx/1.15/certbot/1.7.0/test.wo-da.de/
          ./runDocker
        else
          echo "Invalid Docker Command..."
        fi
    elif [ "$1" = "nakedalpine" ] || [ "$1" = "nakedAlpine" ] || [ "$1" = "minimulLinux" ] || [ "$1" = "minimullinux" ];then
        if [ "$2" = "build" ] || [ "$2" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedAlpine/3.13.2/
          ./buildDockerfile
        elif [ "$2" = "run" ] || [ "$2" = "RUN" ]; then
          if [ "$3" = "eamd" ] || [ "$3" = "EAMD" ]; then
            cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedAlpine/3.13.2/
            ./runDockerWithEAMD
          else
            cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedAlpine/3.13.2/
              ./runDockerfile
          fi
        else
          echo "Invalid Docker Command..."
        fi
    elif [ "$1" = "nakedubuntu" ] || [ "$1" = "nakedUbuntu" ];then
        if [ "$2" = "build" ] || [ "$2" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedUbuntu18.4/
          ./buildDockerfile
        elif [ "$2" = "run" ] || [ "$2" = "RUN" ]; then
          if [ "$3" = "eamd" ] || [ "$3" = "EAMD" ]; then
            cd cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedUbuntu18.4/
            ./runDockerWithEAMD
          else
            cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedUbuntu18.4/
            ./runDockerfile
          fi
        else
          echo "Invalid Docker Command..."
        fi
    elif [ "$1" = "nakeddebian" ] || [ "$1" = "nakedDebian" ];then
        if [ "$2" = "build" ] || [ "$2" = "BUILD" ]; then
          cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedDebian9.12/
          ./buildDockerfile
        elif [ "$2" = "run" ] || [ "$2" = "RUN" ]; then
            cd $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/nakedDebian9.12/
            ./runDockerfile
        else
          echo "Invalid Docker Command..."
        fi
    else
      echo "No Such Docker Image Found...."
    fi
}


once.docker.install(){
  if [ -z "$USERNAME" ]; then
    export USERNAME="$(whoami)"
  fi
  if [ ! $USERNAME = "root" ]; then
    echo "Super User Permissin Required..! Re-run it with super user"
    once.double.line
    exit 0;
  fi
  if [ -x "$(command -v brew)" ]; then
            brew cask install docker
            brew install docker-compose
        elif [ -x "$(command -v apk)" ]; then
            apk update
            apk add docker
            addgroup $USERNAME docker            
            rc-update add docker boot
            service docker start
            apk add docker-compose
        elif [ -x "$(command -v apt-get)" ]; then
            echo "Installing Docker & Docker Compose..."
            apt-get update
            export DEBIAN_FRONTEND=noninteractive
            apt-get install -y docker docker-compose
            # apt-get -y install curl apt-transport-https ca-certificates curl gnupg2 software-properties-common
            # curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
            # add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
            # apt-get update
            # apt-get -y install docker-ce docker-ce-cli containerd.io
            echo usermod -aG docker $USERNAME
            usermod -aG docker $USERNAME
            # curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
            # chmod +x /usr/local/bin/docker-compose
            docker --version
            docker-compose --version
        elif [ -x "$(command -v pacman)" ]; then
            echo "Installing Docker & Docker Compose..."
            pacman -Syu
            echo "installing Docker......"
            pacman -S --needed docker
            echo "installing Docker Compose......"
            pacman -S --needed docker-compose
            groupadd docker
            gpasswd -a ${USERNAME} docker
        else
            message "FAILED TO INSTALL PACKAGE: Package manager not found. You must manually install: $1";
        fi
}

once.deprecated.docker.config(){
  if [ $1 = "pgadmin" ]; then
    once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    if [ -f "pgAdmin.env" ]; then
      echo "pgAdmin.env file already exists...";
    else
    
      echo "Creating pgAdmin.env file"
      {
        echo "PGADMIN_DEFAULT_EMAIL=admin@admin.com"
        echo "PGADMIN_DEFAULT_PASSWORD=qazwsx123"
      } >> pgAdmin.env
      echo 
      echo "pgAdmin.env file created..."
      cat pgAdmin.env
      echo 

    fi
    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
    else

      {
        echo 'version: "3.7"'
        echo 'services:'
        echo '  pgadmin:'
        echo '    container_name: once-pgadmin'
        echo '    image: dpage/pgadmin4:4.18'
        echo '    restart: always'
        echo '    env_file:'
        echo '      - pgAdmin.env'
        echo '    volumes:'
            
        echo '      - ./pgadmin-data:/var/lib/pgadmin'
        echo '    ports:'
        echo '      - "8099:80"'
        echo '      - "7443:443"'
        echo  ''      
        echo  ''      
        # echo 'volumes:'
        # echo '  pgadmin-data:'
        echo 'networks:'
        echo '  default:'
        echo '    external:'
        echo '      name: once-woda-network'
      } >> docker-compose.yml

      echo 
      echo "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
    fi    
    once.deprecated.docker.build pgadmin
  elif [ $1 = "postgresql" ]; then
    once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2
    if [ -f "postgresql.env" ]; then
      echo "postgresql.env file already exists...";
    else
      echo "Creating postgresql.env file"
      {
        echo "POSTGRES_USER=root"
        echo "POSTGRES_PASSWORD=qazwsx123"
        echo "POSTGRES_DB=oncestore"
        echo "APP_DB_USER=once"
        echo "APP_DB_PASS=qazwsx123"
        echo "APP_DB_NAME=oncestore"
      } >> postgresql.env
      echo 
      echo "postgresql.env file created..."
      cat postgresql.env
      echo 

    fi
    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
    else

      {
        echo 'version: "3.7"'
        echo 'services:'
        echo '  postgresql-db-12:'
        echo '    container_name: once-postgresql'
        echo '    image: postgres:12.2'
        echo '    restart: always'
        echo '    env_file:'
        echo '      - postgresql.env'
        echo '    volumes:'
        if [ ! -d "db.init" ]; then
          mkdir -p db.init
          cd db.init
          wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.2/db/01-init.sh
          chmod +x 01-init.sh
          cd ..
        fi
        
        echo '      - ./db.init:/docker-entrypoint-initdb.d/'
        echo '      - ./oncestore.db:/var/lib/postgresql/data'
        echo '    ports:'
        echo '      - "5433:5432"'
        echo  ''      
        echo  ''      
        echo 'networks:'
        echo '  default:'
        echo '    external:'
        echo '      name: once-woda-network'
      } >> docker-compose.yml

      echo 
      echo "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
    fi
    once.deprecated.docker.build postgresql
  elif [ $1 = "woda" ]; then
    once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
    if [ -f "current.env" ]; then
      rm current.env
      echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
      export ONCE_DOCKER_HOST=$HOSTNAME
    else
      echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
      export ONCE_DOCKER_HOST=$HOSTNAME
    fi

    echo 
    echo "current.env file created..."
    cat current.env
    echo
    if [ ! -f "once.sh" ]; then
      cp $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh ./
    else
      rm ./once.sh
      cp $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh ./
    fi
    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
    else

      {
        echo "version: '3'"
        echo "services:"
        echo "  woda-app:"
        echo "    container_name: woda"
        echo "    build: './'"
        echo "    image: woda-nodejs:16.x"            
        echo "    env_file:"
        echo "      - current.env"
        echo "    ports:"
        echo "      - 8080:8080"
        echo "      - 8443:8443"
        echo "      - 5001:5001"
        echo "      - 5002:5002"
        echo "      - 5005:5005"
        echo "    volumes:"
        echo "      - $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/:/usr/local/sbin/"
        echo "      - $ONCE_REPO_PREFIX/EAMD.ucp/Components:$ONCE_REPO_PREFIX/EAMD.ucp/Components"
        echo "      - /var/run/docker.sock:/var/run/docker.sock"
        echo "    command: 'once startlog'"
        echo "networks:"
        echo "  default:"
        echo "    external:"
        echo "      name: once-woda-network"
      } >> docker-compose.yml
      
      echo 
      echo "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
    fi
    if [ -f "Dockerfile" ]; then
      echo "Dockerfile already exists........."
    else
      echo "Creating Dockerfile......."
      {
        echo "# Pull base image."
        echo "FROM ubuntu:20.04"
        
        echo "ENV ONCE_DOCKER_HOST $HOSTNAME"

        echo "WORKDIR /root/"
        echo "ADD ./once.sh ./once.sh"
        echo "RUN chmod +x ./once.sh"
        echo "RUN ./once.sh docker.build"

        echo "CMD [ "/bin/bash" ]"
        echo "# Expose ports."
        echo "EXPOSE 8080"
      } >> Dockerfile    
      
      echo 
      echo "Dockerfile file created..."
      cat Dockerfile
      echo
    fi
    once.deprecated.docker.build woda
  elif [ $1 = "ssl" ]; then
    if [ -z $2 ]; then
      error.log "Domain Name Missing in the command.";
      exit;
    fi
    once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/NginxServer/1.21.3/config
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/NginxServer/1.21.3/config
    if [ -f "app.conf" ]; then
      rm app.conf
    fi

    # cat >> app.conf <<EOL
    {
      export log_c="log_format cache_status '[\$time_local] \"\$request\" \$upstream_cache_status';";
echo 'upstream structr_server  {
    server '$2':8082;
}


upstream http_server  {
    server '$2':8080;
}

upstream https_server  {
    server '$2':8443;
}

  # ============================================================
  # Caching Proxy Settings
  # - everything up to point comes from default nginx Settings
  # ============================================================

  # Specifies the cache_status log format.
  '$log_c'
  # access_log /var/log/nginx/access.log cache_status;
  access_log /var/log/nginx/cache_access.log cache_status;

  # Proxy
  # http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_path
  # Store max 10GB for 1y of inactive resource
  proxy_cache_path /var/cache/nginx use_temp_path=off levels=1:2 keys_zone=cache_zone:100m max_size=10g inactive=1y;

server {
    listen 80;
    server_name '$2';
    server_tokens off;
    root $ONCE_REPO_PREFIX;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /structr {        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_max_temp_file_size 0;     
        proxy_buffering off;
        proxy_connect_timeout 30;
        proxy_send_timeout 30;
        proxy_read_timeout 30;
        proxy_pass http://structr_server;
    }

    location / {                      
        autoindex on;
        proxy_pass  http://http_server;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
    }

    location /woda {        
        autoindex on;
        expires max;
        proxy_cache cache_zone;
        proxy_cache_valid 200 302 301 1y;
        proxy_cache_key $scheme://$host$request_uri;
        proxy_pass  http://http_server/woda;
        #proxy_pass $scheme://$host$request_uri;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        add_header X-Cached $upstream_cache_status;
        add_header X-Cache-Server "nginx-cache";
        proxy_ignore_headers "Set-Cookie"; 
    }

    location /EAMD.ucp {        
        autoindex on;
        proxy_pass  http://http_server/EAMD.ucp;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
    }


    location /auth/ {
            proxy_pass http://'$2':9080/auth/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }  

}
server {
    proxy_busy_buffers_size   512k;
    proxy_buffers   4 512k;
    proxy_buffer_size   256k;
    # rest of nginx config #

    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name '$2';
    server_tokens off;
    ssl_certificate /etc/letsencrypt/live/'$2'/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/'$2'/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass  http://http_server;
    }
    
    location /once/ws/ior {
      proxy_pass  http://http_server/once/ws/ior;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }


    location /once/ {
        proxy_pass  https://'$2':8443/once/;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
    }

    location /EAMD.ucp {        
        autoindex on;
        proxy_pass  https://https_server/EAMD.ucp;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;

    }

    location /structr/ {        
        proxy_pass http://structr_server/structr/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }

    location /auth/ {
            proxy_pass http://'$2':9080/auth/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }  

}'

    } >> app.conf  


    echo 
    warn.log "app.conf file created..."
    cat app.conf
    echo

    once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/
    if [ -f "docker-compose.yml" ]; then
      rm docker-compose.yml
    fi

    cat >> docker-compose.yml <<EOL
version: '3'

services:
  nginx:
    container_name: nginx_proxy
    image: nginx:1.21.3-alpine
    restart: unless-stopped
    volumes:
      - $ONCE_SCENARIO/EAM/1_infrastructure/Docker/NginxServer/1.21.3/config:/etc/nginx/conf.d
      - $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/config/conf:/etc/letsencrypt
      - $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/config/www:/var/www/certbot
    ports:
      - "80:80"
      - "443:443"
    command: "/bin/sh -c 'while :; do sleep 6h & wait \$\${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"
  certbot:
    container_name: nginx_certbot
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/config/conf:/etc/letsencrypt
      - $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/config/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait \$\${!}; done;'"
     
EOL
      echo 
      warn.log "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
      once.docker.build.ssl $2   
  elif [ $1 = "all" ]; then
    once.deprecated.docker.config postgresql
    once.deprecated.docker.config pgadmin
    once.deprecated.docker.config woda

  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.config pgadmin'";
    echo "2. For PostgreSQL 'once docker.config postgresql'";
    echo "3. For WODA 'once docker.config woda'";
    echo
  fi
}

once.docker.build.ssl(){
  if [ -z $1 ]; then
    error.log "Domain Name Missing in the command.";
    exit;
  fi
  #once.scenario.map certbot
  CERTBOT_SCENARIO=$SELECTED_SCENARIO

  cd $ONCE_SCENARIO$CERTBOT_SCENARIO
  if ! [ -x "$(command -v docker-compose)" ]; then
    echo 'Error: docker-compose is not installed.' >&2
    exit 1
  fi

  domains=($1)
  rsa_key_size=4096
  data_path="$ONCE_SCENARIO$CERTBOT_SCENARIO/config/"
  email="marcel.donges@ceruleancircle.com" # Adding a valid address is strongly recommended
  staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

  if [ -d "$data_path" ]; then
    read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
      exit
    fi
  fi


  if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
    echo "### Downloading recommended TLS parameters ..."
    mkdir -p "$data_path/conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
    echo
  fi

  echo "### Creating dummy certificate for $domains ..."
  path="/etc/letsencrypt/live/$domains"
  mkdir -p "$data_path/conf/live/$domains"
  docker-compose run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
      -keyout '$path/privkey.pem' \
      -out '$path/fullchain.pem' \
      -subj '/CN=localhost'" certbot-service
  echo

  once.scenario.map nginx
  NGINX_SCENARIO=$SELECTED_SCENARIO

  echo "### Starting nginx ..."
  cd $ONCE_SCENARIO$NGINX_SCENARIO

  docker-compose up --force-recreate -d nginx-service
  cd $ONCE_SCENARIO$CERTBOT_SCENARIO
  echo

  echo "### Deleting dummy certificate for $domains ..."
  docker-compose run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$domains && \
    rm -Rf /etc/letsencrypt/archive/$domains && \
    rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot-service
  echo


  echo "### Requesting Let's Encrypt certificate for $domains ..."
  #Join $domains to -d args
  domain_args=""
  for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
  done

  # Select appropriate email arg
  case "$email" in
    "") email_arg="--register-unsafely-without-email" ;;
    *) email_arg="--email $email" ;;
  esac

  # Enable staging mode if needed
  if [ $staging != "0" ]; then staging_arg="--staging"; fi

  docker-compose run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
      $staging_arg \
      $email_arg \
      $domain_args \
      --rsa-key-size $rsa_key_size \
      --agree-tos \
      --force-renewal" certbot-service
  echo

  echo "### Reloading nginx ..."
  cd $ONCE_SCENARIO$NGINX_SCENARIO
  docker-compose exec nginx-service nginx -s reload

}


once.deprecated.docker.reconfig(){
  if [ $1 = "pgadmin" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/
    if [ -d "./4.18" ]; then
      echo "Removing old docker config files..."
      rm -r ./4.18
      once.deprecated.docker.config pgadmin
    else
      echo "Creating new docker config files...."
      once.deprecated.docker.config pgadmin
    fi
  elif [ $1 = "postgresql" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/
    if [ -d "./12.2" ]; then
      echo "Removing old docker config files..."
      rm -r ./12.2
      once.deprecated.docker.config postgresql
    else
      echo "Creating new docker config files...."
      once.deprecated.docker.config postgresql
    fi
  elif [ $1 = "woda" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/
    if [ -d "./4.3.0" ]; then
      echo "Removing old docker config files..."
      rm -r ./4.3.0
      once.deprecated.docker.config woda
    else
      echo "Creating new docker config files...."
      once.deprecated.docker.config woda
    fi
    
  elif [ $1 = "all" ]; then
    once.deprecated.docker.reconfig postgresql
    once.deprecated.docker.reconfig pgadmin
    once.deprecated.docker.reconfig woda
  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.reconfig pgadmin'";
    echo "2. For PostgreSQL 'once docker.reconfig postgresql'";
    echo "3. For WODA 'once docker.reconfig woda'";
    echo
  fi

}

once.dc.status()
{
  once.scenario.map $1
  let result=$?
  if [ -z "$1" ]; then
    warn.log "no SCENARIO provided! use one of: ${SCENARIO_MAP_KEYS[@]}"
    return 1
  fi
  echo "SELECTED_SCENARIO_NAME: $SELECTED_SCENARIO_NAME"
  echo "               Version: $SELECTED_SCENARIO_VERSION"
  echo
  echo "         ONCE_SCENARIO: $ONCE_SCENARIO"
  echo "      current SCENARIO: $ONCE_SCENARIO$SELECTED_SCENARIO"

  if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
    echo -e "      current SCENARIO:    folder              \e[1;32m EXISTS \e[0m"
    if [ -f "$ONCE_SCENARIO$SELECTED_SCENARIO/docker-compose.yml" ]; then
      echo -e "      current SCENARIO:    docker-compose.yaml \e[1;32m EXISTS \e[0m"
    else
      echo -e "      current SCENARIO:    docker-compose.yml \e[1;31m MISIING \e[0m"
      tree -a $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
  else
    echo -e "      current SCENARIO:    \e[1;31m MISIING \e[0m"
  fi
  echo "
       "
  local DI_NAME=$(echo $SELECTED_SCENARIO_DI_NAME | cut -d: -f1)
  local DI_TAG=$(echo $SELECTED_SCENARIO_DI_NAME | cut -d: -f2) 
  local image_details=$(docker image ls | grep "$DI_NAME")
  local volume_details=$(docker volume ls | grep "$SELECTED_SCENARIO_NAME-volume")
  local network_details=$(docker network ls | grep "$SELECTED_SCENARIO_NAME")
  local service_details=$(docker ps | grep "$SELECTED_SCENARIO_DC_NAME")

  local image_list=$(docker volume ls | grep "$SELECTED_SCENARIO_NAME-volume" | tr -s ' ' | cut -d\  -f2 | tr '\n' ' ')
  
  local image_status="\e[1;32m EXISTS \e[0m"
  if [ -z "$image_details" ]; then
    image_status="\e[1;31m MISIING \e[0m"
  fi 
  local volume_status="\e[1;32m EXISTS \e[0m"
  if [ -z "$volume_details" ]; then
    volume_status="\e[1;31m MISIING \e[0m"
  fi 
  local network_status="\e[1;32m EXISTS \e[0m"
  if [ -z "$network_details" ]; then
    network_status="\e[1;31m MISIING \e[0m"
  fi
  local service_status="\e[1;32m UP \e[0m"
  if [ -z "$service_details" ]; then
    service_status="\e[1;31m DOWN \e[0m"
  fi    
  #local container_details=$(docker container ls | grep "$SELECTED_SCENARIO_NAME")
  echo "DOCKER     image:     $SELECTED_SCENARIO_DI_NAME     name: $DI_NAME tag: $DI_TAG"

  echo "          volume:     $SELECTED_SCENARIO_NAME-volume:"
  echo "         network: $SELECTED_SCENARIO_NETWORKS"
  echo "         service: $SELECTED_SCENARIO_NAME-service:"
  echo "       container: $SELECTED_SCENARIO_DC_NAME"
  echo "
       "
  echo -e "image details:   $image_status
$image_details"
  echo -e "volumen details: $volume_status
$volume_details"
  echo -e "network details: $network_status
$network_details"
  echo -e "service details: $service_status
$service_details"
#   echo "container details: 
# $container_details"
for l in $image_list
  do
    echo docker volume rm $l
  done
}

once.dc.backup.restore()
{
  cd $startDir
  if [ -f ./.env ]; then
    source .env
    if [ "$PWD" = "$SELECTED_SCENARIO_BACKUP_DIR" ]; then
      once.dc.status $SELECTED_SCENARIO_NAME
      if ! [ -d $SELECTED_SCENARIO_PATH ]; then
        once.dc.create $SELECTED_SCENARIO_NAME
        once.dc.status $SELECTED_SCENARIO_NAME
      fi

      once.scenario.map $SELECTED_SCENARIO_NAME
      echo "Container ID: $SELECTED_SCENARIO_CONTAINER_ID $SELECTED_SCENARIO_DC_NAME"
      let ID=$SELECTED_SCENARIO_CONTAINER_ID
      if [ -n "$SELECTED_SCENARIO_CONTAINER_ID" ]; then 
        docker stop $ID
        source $startDir/.env
        docker run --rm --volumes-from "${SELECTED_SCENARIO_DC_NAME}" -v $startDir:/backup alpine:3.8 tar xvf "/backup/${SELECTED_SCENARIO_BACKUP_FOLDER}.tar"
        #docker start $ID
        once.dc.start $SELECTED_SCENARIO_NAME
      fi
      once.dc.status $SELECTED_SCENARIO_NAME
    else
      echo "this does not seem to be a correct backup directory: $PWD"
    fi
  else
    warn.log "please cd int the directory of the volume backup. $PWD"
  fi
}


once.dc.create()
{
  if once.scenario.map $1 create; then
    echo "scenario $1"
  else
    warn.log "no SCENARIO provided! use one of: ${SCENARIO_MAP_KEYS[@]}"
    return 1
  fi
  DOCKER_SCENARIO=$1
  shift 

  once.dc.stop $DOCKER_SCENARIO
  once.dc.create.$DOCKER_SCENARIO "$@"
  once.dc.start $DOCKER_SCENARIO
  ls -al
  docker ps
}

once.dc.delete()
{
  once.scenario.map $1
  let result=$?
  if [ -z "$1" ]; then
    warn.log "no SCENARIO provided! use one of: ${SCENARIO_MAP_KEYS[@]}"
    return 1
  fi
  DOCKER_SCENARIO=$1
  shift 
  
  once.dc.backup.volumes $DOCKER_SCENARIO
  once.dc.stop $DOCKER_SCENARIO
  once.dc.delete.$DOCKER_SCENARIO
  once.scenario.delete $SELECTED_SCENARIO yes
}

once.dc.inspect()
{
  if once.scenario.map $1; then
    echo scenario $1
  else
    echo no scenario $1...$?
    return
  fi

  docker run -it $SELECTED_SCENARIO_DI_NAME bash
} 

once.dc.log()
{
  if once.scenario.map $1; then
    echo scenario $1
  else
    echo no scenario $1...$?
    return
  fi

  docker logs $SELECTED_SCENARIO_NAME
} 

once.dc.go()
{
  if once.scenario.map $1; then
    echo scenario $1
  else
    echo no scenario $1...$?
    return
  fi

  fix cd $SELECTED_SCENARIO_PATH
} 





once.dc.start()
{
  if once.scenario.map $1; then
    echo scenario $1
  else
    echo no scenario $1...$?
    return
  fi

  docker-compose ps --services --filter "status=running" | grep $SELECTED_SCENARIO_NAME-service
  export status=$?
  if [ $status = 0 ]; then
    echo "Container $SELECTED_SCENARIO_DC_NAME is runing...";
    if [ -z "$ONCE_TMP_DURING_INSTALL" ]; then
      echo "entering container"
      docker exec -it $SELECTED_SCENARIO_DC_NAME bash
    else
      echo "during installation not entering running container...."
    fi
  else
    echo "Container is not runing...";
    echo "Re-Building image and container...";

    docker-compose up --build --remove-orphans --force-recreate -d
  fi

}

once.dc.stop()
{
  if once.scenario.map $1; then
    echo scenario $1
  else
    echo no scenario $1...$?
    return
  fi

  docker-compose ps --services --filter "status=running" | grep $SELECTED_SCENARIO_NAME-service
  local status=$?
  if [ $status = 0 ]; then
    echo "Container $SELECTED_SCENARIO_DC_NAME is runing...";
    docker-compose stop
  else
    echo "Container $SELECTED_SCENARIO_DC_NAME is not runing...";
    docker ps
  fi

}

once.dc.backup.volumes()
{
  if once.scenario.map $1; then
    echo scenario $1
  else
    echo no scenario $1...$?
    return
  fi

  if [ -n "$SELECTED_SCENARIO_CONTAINER_ID" ]; then
    echo "Scenario is up: $SELECTED_SCENARIO_CONTAINER_ID, $SELECTED_SCENARIO_DC_NAME"
    once.dc.stop $SELECTED_SCENARIO_NAME
  else
    echo "Scenario is down: $SELECTED_SCENARIO_CONTAINER_ID"
  fi
  local DI_NAME=$(echo $SELECTED_SCENARIO_DI_NAME | cut -d: -f1)
  local DI_TAG=$(echo $SELECTED_SCENARIO_DI_NAME | cut -d: -f2) 

  if [ -n "$SELECTED_SCENARIO_BACKUP" ]; then
    echo "Scenario has a backup path: $SELECTED_SCENARIO_BACKUP, $SELECTED_SCENARIO_DC_NAME"
  else
    echo "Scenario has NO backup path: $SELECTED_SCENARIO_BACKUP, $SELECTED_SCENARIO_DC_NAME"
    return 1
  fi


  BACKUP_FOLDER="backup.$DI_NAME$DI_TAG_$SELECTED_SCENARIO_NAME-volume-$(date '+%Y-%m-%d-%H-%M-%S')"
  BACKUP_DIR="$ONCE_REPO_PREFIX/backup/$BACKUP_FOLDER"
  if ! [ -d "$BACKUP_DIR" ]; then
    once.path.create $BACKUP_DIR
  fi
  docker run --rm --volumes-from $SELECTED_SCENARIO_DC_NAME -v $ONCE_REPO_PREFIX/backup/$BACKUP_FOLDER:/backup alpine:3.8 tar cvf "/backup/${BACKUP_FOLDER}.tar" "${SELECTED_SCENARIO_BACKUP}"
  warn.log "backing up to: $BACKUP_DIR"
  
  SELECTED_SCENARIO_BACKUP_FOLDER=$BACKUP_FOLDER
  SELECTED_SCENARIO_BACKUP_DIR=$BACKUP_DIR
  set | grep ^SELECTED_SCENARIO >$BACKUP_DIR/.env
  tree -a /var/dev/backup/
  cat $BACKUP_DIR/.env

  if [ -n "$SELECTED_SCENARIO_CONTAINER_ID" ]; then
    echo "restarting container"
    docker start $SELECTED_SCENARIO_CONTAINER_ID
    docker ps
  fi
}



function once.dc.create.nginx()
{
    once.dc.delete.nginx

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi
  
  if [ -z $1 ]; then
    error.log "Domain Name Missing in the command.";
    exit;
  fi

    if [ ! -d "config" ]; then
      mkdir -p config
      cd config/
    fi
    # if [ -f "app.conf" ]; then
    #   rm app.conf
    # fi

    # cat >> app.conf <<EOL
    {
      export log_c="log_format cache_status '[\$time_local] \"\$request\" \$upstream_cache_status';";
echo 'upstream structr_server  {
    server '$1':8082;
}


upstream http_server  {
    server '$1':8080;
}

upstream https_server  {
    server '$1':8443;
}

  # ============================================================
  # Caching Proxy Settings
  # - everything up to point comes from default nginx Settings
  # ============================================================

  # Specifies the cache_status log format.
  '$log_c'
  # access_log /var/log/nginx/access.log cache_status;
  access_log /var/log/nginx/cache_access.log cache_status;

  # Proxy
  # http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_path
  # Store max 10GB for 1y of inactive resource
  proxy_cache_path /var/cache/nginx use_temp_path=off levels=1:2 keys_zone=cache_zone:100m max_size=10g inactive=1y;

server {
    listen 80;
    server_name '$1';
    server_tokens off;
    root '$ONCE_REPO_PREFIX';

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location /structr {        
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        proxy_max_temp_file_size 0;     
        proxy_buffering off;
        proxy_connect_timeout 30;
        proxy_send_timeout 30;
        proxy_read_timeout 30;
        proxy_pass http://structr_server/structr/;
    }

    location / {                      
        autoindex on;
        proxy_pass  http://http_server;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
    }

    location /woda {        
        autoindex on;
        expires max;
        proxy_cache cache_zone;
        proxy_cache_valid 200 302 301 1y;
        proxy_cache_key $scheme://$host$request_uri;
        proxy_pass  http://http_server/woda;
        #proxy_pass $scheme://$host$request_uri;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        add_header X-Cached $upstream_cache_status;
        add_header X-Cache-Server "nginx-cache";
        proxy_ignore_headers "Set-Cookie"; 
    }

    location /EAMD.ucp {        
        autoindex on;
        proxy_pass  http://http_server/EAMD.ucp;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
    }


    location /auth/ {
            proxy_pass http://'$1':9080/auth/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }  
    location /snet/ {        
        proxy_pass http://'$1':8180/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }
}
server {
    proxy_busy_buffers_size   512k;
    proxy_buffers   4 512k;
    proxy_buffer_size   256k;
    # rest of nginx config #

    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name '$1';
    server_tokens off;
    ssl_certificate /etc/letsencrypt/live/'$1'/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/'$1'/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass  http://http_server;
    }
    
    location /once/ws/ior {
      proxy_pass  http://http_server/once/ws/ior;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header Host $host;

      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
    }


    location /once/ {
        proxy_pass http://http_server/once/;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
    }

    location /EAMD.ucp/ {        
        autoindex on;
        proxy_pass  http://http_server/EAMD.ucp/;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;

    }

    location /structr/ {        
        proxy_pass http://structr_server/structr/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }

    location /auth/ {
            proxy_pass http://'$1':9080/auth/;

          proxy_http_version 1.1;

          proxy_set_header Host               $host;
          proxy_set_header X-Real-IP          $remote_addr;
          proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto  $scheme;
    }  

    location /pgadmin/ {
            proxy_pass http://'$1':8099/;

          proxy_http_version 1.1;
          proxy_set_header X-Script-Name /pgadmin;
          proxy_set_header X-Scheme $scheme;
          proxy_set_header Host               $host;
          proxy_redirect off;
    }
    
    location /snet/ {        
        proxy_pass http://'$1':8180/;
        proxy_http_version 1.1;  
        proxy_set_header Host $host;  
        proxy_set_header Upgrade $http_upgrade;  
        proxy_set_header Connection 'upgrade';  
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade; 
    }  

    location /api {
        proxy_pass http://'$1':8180/api;
    }
    location /v2 {
       proxy_pass http://'$1':8180/v2;
    }
 

}'

    } >> app.conf  

    cd ..
    echo 
    warn.log "app.conf file created..."
    cat app.conf
    echo

    if [ -f "docker-compose.yml" ]; then
      rm docker-compose.yml
    fi
  once.scenario.map certbot
  CERTBOT_SCENARIO=$SELECTED_SCENARIO

  once.scenario.map nginx
  NGINX_SCENARIO=$SELECTED_SCENARIO

  # $ONCE_SCENARIO$CERTBOT_SCENARIO
    cat >> docker-compose.yml <<EOL
version: '3'

services:
  $SELECTED_SCENARIO_NAME-service:
    container_name: $SELECTED_SCENARIO_DC_NAME
    image: nginx:1.21.3-alpine
    restart: unless-stopped
    volumes:
      - $ONCE_SCENARIO$NGINX_SCENARIO/config/:/etc/nginx/conf.d/
      - $ONCE_SCENARIO$CERTBOT_SCENARIO/config/conf:/etc/letsencrypt
      - $ONCE_SCENARIO$CERTBOT_SCENARIO/config/www:/var/www/certbot
    ports:
      - "80:80"
      - "443:443"
    command: "/bin/sh -c 'while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g \"daemon off;\"'"   
networks:
  default:
    external:
      name: once-woda-network
EOL
      echo 
      warn.log "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
      echo "Building Nginx Docker......"
      # once.docker.build.ssl $1
}

function once.dc.delete.nginx()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi

    if [ -f "app.conf" ]; then
      echo "removing app.conf...";
      rm app.conf
    fi

    if [ -f "docker-compose.yml" ]; then
      echo "Removing docker-compose.yml...";
      rm docker-compose.yml
    fi

}


function once.dc.create.certbot()
{
    once.dc.delete.certbot

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi
  
  if [ -z $1 ]; then
    error.log "Domain Name Missing in the command.";
    exit;
  fi

    if [ -f "docker-compose.yml" ]; then
      rm docker-compose.yml
    fi
  once.scenario.map certbot
  CERTBOT_SCENARIO=$SELECTED_SCENARIO

  # once.scenario.map nginx
  # NGINX_SCENARIO=$SELECTED_SCENARIO
    cat >> docker-compose.yml <<EOL
version: '3'
services:
  $SELECTED_SCENARIO_NAME-service:
    container_name: $SELECTED_SCENARIO_DC_NAME
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - $ONCE_SCENARIO$CERTBOT_SCENARIO/config/conf:/etc/letsencrypt
      - $ONCE_SCENARIO$CERTBOT_SCENARIO/config/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait \$\${!}; done;'"
networks:
  default:
    external:
      name: once-woda-network
EOL
      echo 
      warn.log "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
      echo "Building Certbot Docker......"
      once.docker.build.ssl $1
}

function once.dc.delete.certbot()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    # if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
    #   console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
    #   rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
    #   once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
    #   cd $ONCE_SCENARIO$SELECTED_SCENARIO
    # fi
    
    # if [ -f "postgresql.env" ]; then
    #   echo "postgresql.env file already exists...";
    #   rm postgresql.env
    # fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi

}


function once.dc.delete.pg()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    if [ -f "postgresql.env" ]; then
      echo "postgresql.env file already exists...";
      rm postgresql.env
    fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi

}

function once.dc.delete.keycloak()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    # if [ -f "postgresql.env" ]; then
    #   echo "postgresql.env file already exists...";
    #   rm postgresql.env
    # fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi


    if [ -f "Dockerfile" ]; then
      echo "Dockerfile file already exists...";
      rm Dockerfile
    fi
    rm -r realm-config standalone themes

}


function once.dc.delete.jhipster()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    # if [ -f "postgresql.env" ]; then
    #   echo "postgresql.env file already exists...";
    #   rm postgresql.env
    # fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi


}


function once.dc.delete.structr()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    if [ -f ".env" ]; then
      echo ".env file already exists...";
      rm .env
    fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi

    if [ -f "Dockerfile" ]; then
      echo "Dockerfile file already exists...";
      rm Dockerfile
    fi


    if [ -f "start-structr.sh" ]; then
      echo "start-structr.sh file already exists...";
      rm start-structr.sh
    fi

}

function once.dc.delete.psql()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    if [ -d "db.init" ]; then
      # echo "postgresql.env file already exists...";
      rm -r db.init
    fi

    if [ -f "postgresql.env" ]; then
      echo "postgresql.env file already exists...";
      rm postgresql.env
    fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi

}

function once.dc.delete.pgadmin()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    if [ -f "postgresql.env" ]; then
      echo "postgresql.env file already exists...";
      rm postgresql.env
    fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi

}

function once.dc.delete.pgv()
{
    local image_list=$(docker volume ls | grep "$SELECTED_SCENARIO_NAME-volume" | tr -s ' ' | cut -d\  -f2 | tr '\n' ' ')
    for l in $image_list
      do
        echo docker volume rm $l
        docker volume rm $l
      done
    
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME
    docker volume rm $SELECTED_SCENARIO_NAME-volume

    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network delete ${NETWORK_NAME} ; 
    fi


    if [ -d "$ONCE_SCENARIO$SELECTED_SCENARIO" ]; then
      console.log "Removing old docker config files...: $ONCE_SCENARIO$SELECTED_SCENARIO"
      rm -r $ONCE_SCENARIO$SELECTED_SCENARIO
      once.path.create $ONCE_SCENARIO$SELECTED_SCENARIO
      cd $ONCE_SCENARIO$SELECTED_SCENARIO
    fi
    
    if [ -f "postgresql.env" ]; then
      echo "postgresql.env file already exists...";
      rm postgresql.env
    fi

    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
      rm docker-compose.yml
    fi

}

function once.dc.create.pgv()
{
  once.dc.stop pgv
  once.dc.delete.pgv

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi

    echo "Creating postgresql.env file"
    {
      echo "POSTGRES_USER=root"
      echo "POSTGRES_PASSWORD=qazwsx123"
      echo "POSTGRES_DB=oncestore"
      echo "APP_DB_USER=once"
      echo "APP_DB_PASS=qazwsx123"
      echo "APP_DB_NAME=oncestore"
    } >> postgresql.env
    echo 
    warn.log "postgresql.env file created..."
    cat postgresql.env
    echo 


    # if [ -f "docker-compose.yml" ]; then
    #   echo "docker-compose file already exists...";
    #   rm docker-compose.yml
    # fi

    {
      echo "FROM postgres:12.2"
      # ENV POSTGRES_PASSWORD docker
      # ENV POSTGRES_DB world
      echo "COPY ./db.init/01-init.sh /docker-entrypoint-initdb.d/"
    } >> Dockerfile

    {
      echo 'version: "3.7"'
      echo 'services:'
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo '    build: .'
      echo "    image: $SELECTED_SCENARIO_DI_NAME"
      echo '    restart: always'
      echo '    env_file:'
      echo '      - postgresql.env'
      echo '    volumes:'
      if [ ! -d "db.init" ]; then
        mkdir -p db.init
        cd db.init
        wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.2/db/01-init.sh
        chmod +x 01-init.sh
        cd ..
      fi
      
      # echo '      - ./db.init:/docker-entrypoint-initdb.d/'
      echo "      - $SELECTED_SCENARIO_NAME-volume:/var/lib/postgresql/data"
      echo "      - woda-volume:$ONCE_REPO_PREFIX"
      echo '    ports:'
      echo '      - "5433:5432"'
      echo  ''      
      echo  ''      
      echo 'volumes:'
      echo "  $SELECTED_SCENARIO_NAME-volume:"
      echo "  woda-volume:"
      echo 'networks:'
      echo '  default:'
      echo '    external:'
      echo '      name: once-woda-network'
    } >> docker-compose.yml

    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo
}

function once.dc.create.keycloak()
{
    once.dc.delete.keycloak

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi


    # if [ -f "docker-compose.yml" ]; then
    #   echo "docker-compose file already exists...";
    #   rm docker-compose.yml
    # fi
    if [ -d "$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/realm-config/" ]; then
      cp -r $ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/realm-config/ ./realm-config
    else
      wget -r https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/realm/
      mv test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/realm-config/ ./realm-config
    fi
    # rm -r test.wo-da.de

    if [ -d "$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/standalone/" ]; then
      cp -r $ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/standalone/ ./standalone 
    else
      wget -r https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/standalone/
      mv test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/standalone/ ./standalone 
    fi
    # rm -r test.wo-da.de

    if [ -d "$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/themes/" ]; then
      cp -r $ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/themes/ ./themes 
    else
      wget -r https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/themes/
      mv test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/themes/ ./themes 
    fi


    if [ -d "$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/tools/" ]; then
      cp -r $ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/tools/ ./tools 
      chmod 777 -R ./tools
    else
      wget -r https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/tools/
      mv test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/keycloak/Keycloak/12.0.4/tools/ ./tools
      chmod 777 -R ./tools
    fi

    rm -r test.wo-da.de
    tree

    {
      echo "FROM registry.access.redhat.com/ubi8-minimal"

      echo "ENV KEYCLOAK_VERSION 12.0.4"
      echo "ENV JDBC_POSTGRES_VERSION 42.2.5"

      echo "ENV LAUNCH_JBOSS_IN_BACKGROUND 1"
      echo "ENV PROXY_ADDRESS_FORWARDING false"
      echo "ENV JBOSS_HOME /opt/jboss/keycloak"
      echo "ENV LANG en_US.UTF-8"

      echo "ARG GIT_REPO"
      echo "ARG GIT_BRANCH"
      echo "ARG KEYCLOAK_DIST=https://github.com/keycloak/keycloak/releases/download/\$KEYCLOAK_VERSION/keycloak-\$KEYCLOAK_VERSION.tar.gz"

      echo "USER root"

      echo "RUN microdnf update -y && microdnf install -y vim glibc-langpack-en gzip hostname java-11-openjdk-headless openssl tar which && microdnf clean all"

      echo "ADD tools /opt/jboss/tools"
      echo "RUN /opt/jboss/tools/build-keycloak.sh"

      echo "USER 1000"

      echo "EXPOSE 9080"
      echo "EXPOSE 9443"

      echo 'ENTRYPOINT [ "/opt/jboss/tools/docker-entrypoint.sh" ]'

      echo 'CMD ["-b", "0.0.0.0"]'
    } >> Dockerfile

    {
      echo "version: '3'"

      echo "services:"
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "      container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "      image: jboss/keycloak:12.0.4"
      echo "      build: ."
      echo "      command:"
      echo "        ["
      echo "          '-b',"
      echo "          '0.0.0.0',"
      echo "          '-Dkeycloak.migration.action=import',"
      echo "          '-Dkeycloak.migration.provider=dir',"
      echo "          '-Dkeycloak.migration.dir=/opt/jboss/keycloak/realm-config',"
      echo "          '-Dkeycloak.migration.strategy=IGNORE_EXISTING',"
      echo "          '-Djboss.socket.binding.port-offset=1000',"
      echo "          '-Dkeycloak.profile.feature.upload_scripts=enabled',"
      echo "        ]"
      echo "      volumes:"
      echo "        - ./realm-config:/opt/jboss/keycloak/realm-config"
      echo "        - ./standalone/configuration:/opt/jboss/keycloak/domain/configuration"
      echo "        - ./themes/shifterNetwork:/opt/jboss/keycloak/themes/shifterNetwork"
      echo "      environment:"
      echo "        DB_VENDOR: POSTGRES"
      echo "        DB_ADDR: psql-service"
      echo "        DB_DATABASE: keycloak"
      echo "        DB_USER: shifternetzwerk"
      echo "        DB_PASSWORD: qazwsx123"
      echo "        KEYCLOAK_USER: admin"
      echo "        KEYCLOAK_PASSWORD: admin"
      echo '        PROXY_ADDRESS_FORWARDING: "true"'
      echo "      ports:"
      echo "        - 9080:9080"

      echo "networks:"
      echo "  default:"
      echo "    external:"
      echo "      name: once-woda-network"
      
    } >> docker-compose.yml

    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo
    # exit;
}


function once.dc.create.jhipster()
{
  if [ -z $1 ]; then
    echo
    error.log "Domain Name Missing in the command.";
    exit;
  fi
    once.dc.delete.jhipster

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi


    if [ -f "$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/tech/jhipster/JHipster/6.7.1/src/shifternetzwerk-1.1.1.jar" ]; then
      cp -r $ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/tech/jhipster/JHipster/6.7.1/src/shifternetzwerk-1.1.1.jar ./shifternetzwerk-1.1.1.jar
      chmod 777 -R ./tools
    else
      wget -r https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/tech/jhipster/JHipster/6.7.1/src/shifternetzwerk-1.1.1.jar
      mv test.wo-da.de/EAMD.ucp/3rdPartyComponents/tech/jhipster/JHipster/6.7.1/src/shifternetzwerk-1.1.1.jar ./shifternetzwerk-1.1.1.jar
      
    fi

    rm -r test.wo-da.de
    tree

    {
      echo "FROM adoptopenjdk:11-jre-hotspot"
      echo "ARG JAR_FILE=*.jar"
      echo "COPY \${JAR_FILE} shifternetzwerk.jar"
      echo 'ENTRYPOINT ["java", "-jar", "shifternetzwerk.jar"]'

    } >> Dockerfile
    echo 
    warn.log "Dockerfile file created..."
    cat Dockerfile

    {
      echo "version: '2'"
      echo "services:"
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "    image: snet/jhipster:1.0.0"
      echo "    build: ."
      echo "    environment:"
      echo "      - _JAVA_OPTIONS=-Xmx512m -Xms256m"
      echo "      - SPRING_PROFILES_ACTIVE=prod,swagger"
      echo "      - SERVER_PORT=8180"
      echo "      - MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=true"
      echo "      - SPRING_DATASOURCE_URL=jdbc:postgresql://psql-service:5432/shifternetzwerk"
      echo "      - SPRING_DATASOURCE_USERNAME=shifternetzwerk"
      echo "      - SPRING_DATASOURCE_PASSWORD=qazwsx123"
      echo "      - SPRING_SECURITY_OAUTH2_CLIENT_PROVIDER_OIDC_ISSUER_URI=https://$1/auth/realms/master"
      echo "      - SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_OIDC_CLIENT_ID=shifternetzwerk"
      echo "      - SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_OIDC_CLIENT_SECRET=shifternetzwerk"
      echo "      - JHIPSTER_SLEEP=30 # gives time for other services to boot before the application"
      echo "    ports:"
      echo "      - 8180:8180"

      echo "networks:"
      echo "  default:"
      echo "    external:"
      echo "      name: once-woda-network"
      
    } >> docker-compose.yml
    pwd
    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo
}


function once.dc.create.psql()
{
    once.dc.delete.psql

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi

    echo "Creating postgresql.env file"
    {
      echo "POSTGRES_USER=shifternetzwerk"
      echo "POSTGRES_PASSWORD=qazwsx123"
      echo "POSTGRES_DB=shifternetzwerk"
      echo "APP_DB_USER=keycloak"
      echo "APP_DB_PASS=qazwsx123"
      echo "APP_DB_NAME=keycloak"
    } >> postgresql.env
    echo 
    warn.log "postgresql.env file created..."
    cat postgresql.env
    echo 

    rm -r ./db.init/
    if [ ! -d "./db.init" ]; then
      mkdir -p db.init
      cd db.init
      if [ -f "/var/dev/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/01-init.sh" ]; then
        cp /var/dev/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/01-init.sh ./01-init.sh
        chmod 777 01-init.sh
      else
        wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/01-init.sh
        chmod 777 01-init.sh
      fi
      if [ -f "/var/dev/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/backup_clean.sql" ]; then
        cp /var/dev/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/backup_clean.sql ./backup_clean.sql
        chmod 777 01-init.sh
      else
        wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/backup_clean.sql
        chmod 777 backup_clean.sql
      fi
      if [ -f "/var/dev/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/keycloak.sql" ]; then
        cp /var/dev/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/keycloak.sql ./keycloak.sql
        chmod 777 keycloak.sql
      else
        wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.3/keycloak.sql
        chmod 777 keycloak.sql
      fi
      cd ..
    fi

    {
      echo "FROM postgres:12.3"
      # ENV POSTGRES_PASSWORD docker
      echo "COPY ./db.init/* /docker-entrypoint-initdb.d/"
    } >> Dockerfile

    {
      echo "version: '3.7'"
      echo "services:"
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "    build: ."
      echo "    image: postgres:12.3"
      echo "    environment:"
      echo "      - POSTGRES_USER=shifternetzwerk"
      echo "      - POSTGRES_PASSWORD=qazwsx123"
      echo "    env_file:"
      echo "      - postgresql.env"
      echo "    volumes:"
      echo "      - ./db.init:/docker-entrypoint-initdb.d/"
      echo "      - $SELECTED_SCENARIO_NAME-volume:/var/lib/postgresql/data"
      echo "    ports:"
      echo "      - 5432:5432"
      echo 'volumes:'
      echo "  $SELECTED_SCENARIO_NAME-volume:"
      echo "networks:"
      echo "  default:"
      echo "    external:"
      echo "      name: once-woda-network"

    } >> docker-compose.yml

    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo
}

function once.dc.create.structr()
{
    once.dc.delete.structr

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi

  if [ -z $1 ]; then
    error.log "Domain Name Missing in the command.";
    exit;
  fi
    wget https://test.wo-da.de/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Openjdk/8/Structr/2.1.4/src/start-structr.sh
    chmod +x ./start-structr.sh

    

    wget https://test.wo-da.de/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Openjdk/8/Structr/2.1.4/src/structr.conf
    chmod 777 ./structr.conf
    
  once.scenario.map certbot
  CERTBOT_SCENARIO=$SELECTED_SCENARIO

  once.scenario.map structr
  structr_SCENARIO=$SELECTED_SCENARIO
    
    echo "Creating .env file for  structr"

    {
      echo "defaultWorkspace=/EAMD.ucp"
      echo "defaultServer=https://$1"
      echo "structr_dir=./Workspaces/structrAppWorkspace/WODA-current"
      echo "files_dir=/EAMD.ucp"
      echo "UID=0"
      echo "GID=33"
    }>> .env

    # echo $ONCE_SCENARIO/EAM/1_infrastructure/Docker/CertBot/1.7.0/config/conf/archive/$1/

    if [ -f "keystore.pkcs12" ]; then
      echo "Removing old keystore.pkcs12...";
      rm keystore.pkcs12
      # if [ -f "./fullchain.pem" ]; then
        echo "Coping fullchain.pem file...."
        ln -s $ONCE_SCENARIO$CERTBOT_SCENARIO/config/conf/live/$1/fullchain.pem fullchain.pem
      # fi

      # if [ -f "./private.pem" ]; then
        echo "Coping private.pem file...."
        ln -s $ONCE_SCENARIO$CERTBOT_SCENARIO/config/conf/live/$1/privkey.pem ./privkey.pem
      # fi

      echo "Creating New keystore.pkcs12...."      
      openssl pkcs12 -export -out keystore.pkcs12 -in fullchain.pem -inkey privkey.pem -password pass:qazwsx#123

      if [ -f "keystore.pkcs12" ]; then
        echo "File keystore.pkcs12 created successfully...."
      else
        echo "something went work while creating please try again & check file location...";
        exit
      fi
    else
      # if [ -f "./fullchain.pem" ]; then
        echo "Coping fullchain.pem file...."
        rm ./fullchain.pem
        ln -s $ONCE_SCENARIO$CERTBOT_SCENARIO/config/conf/live/$1/fullchain.pem ./fullchain.pem
        
      # fi

      # if [ -f "./private.pem" ]; then
        echo "Coping private.pem file...."
        rm ./privkey.pem
        ln -s $ONCE_SCENARIO$CERTBOT_SCENARIO/config/conf/live/$1/privkey.pem ./privkey.pem
      # fi

      echo "Creating New keystore.pkcs12...."      
      openssl pkcs12 -export -out keystore.pkcs12 -in fullchain.pem -inkey privkey.pem -password pass:qazwsx#123

      if [ -f "keystore.pkcs12" ]; then
        echo "File keystore.pkcs12 created successfully...."
      else
        echo "something went work while creating please try again & check file location...";
        exit
      fi
    fi
    if [ ! -d "./Workspaces" ]; then    
        echo "Creating Workspace Directory......."
        # cd $ONCE_REPO_PREFIX/
        if [ ! -f "$ONCE_REPO_PREFIX/EAMD.ucp/Components/org/structr/StructrServer/2.1.4/dist/Workspaces.zip" ]; then
          wget https://test.wo-da.de/EAMD.ucp/Components/org/structr/StructrServer/2.1.4/dist/Workspaces.zip
          unzip -q ./Workspaces.zip
        else 
          unzip  -q $ONCE_REPO_PREFIX/EAMD.ucp/Components/org/structr/StructrServer/2.1.4/dist/Workspaces.zip
        fi
        
    fi    
    if [ ! -f "structr.zip" ]; then    
      if [ ! -f $ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/1.0.0/Alpine/3.13.2/Openjdk/8/Structr/2.1.4/src/structr.zip ]; then
          echo "Coping structr.zip files...."
          cp $ONCE_REPO_PREFIX/EAMD.ucp/Components/org/structr/StructrServer/2.1.4/dist/structr.zip ./
      else
        wget https://test.wo-da.de/EAMD.ucp/Components/org/structr/StructrServer/2.1.4/dist/structr.zip
      fi
    fi
    
    echo "Creating Dockerfile file"
    {
      echo "FROM openjdk:8-jdk-alpine"

      echo "#ARG STRUCTR_VERSION"
      echo "ARG JAVA_OPT_XMS=4"
      echo "ARG JAVA_OPT_XMX=4"

      echo "ARG UID=\${UID}"
      echo "ARG GID=\${GID}"
      echo "USER \${UID}:\${GID}"
      
      echo "ENV JAVA_OPT_XMS=\$JAVA_OPT_XMS"
      echo "ENV JAVA_OPT_XMX=\$JAVA_OPT_XMX"

      echo "#ENV defaultServer \$defaultServer"

      echo "ENV WORK_DIR /var/lib/structr"

      echo 'ENV PATH="${PATH}:${WORK_DIR}/scripts"'


      echo 'ENV TERM="xterm"'

      echo 'ENV defaultServer="${defaultServer}"'

      echo "RUN apk add unzip git tree ncurses openssh-client bash curl wget"
      echo "RUN mkdir \${WORK_DIR}"
      echo "WORKDIR \${WORK_DIR}"
      echo "ADD structr.zip /"
      echo "RUN unzip -q /structr.zip -d /var/lib && rm /structr.zip"
      echo "ADD structr.conf \${WORK_DIR}/"
      echo "ADD keystore.pkcs12 \${WORK_DIR}/"
      echo "RUN mkdir /usr/lib/structr"
      echo "ADD keystore.pkcs12 /usr/lib/structr/"
      echo "ADD start-structr.sh \${WORK_DIR}/bin"

      
      echo 'ENTRYPOINT [ "bin/start-structr.sh" ]'
      

    } >> Dockerfile
    echo 
    warn.log "Structr Dockefile file created..."
    cat Dockerfile
    echo 
    
    {
      echo "version: '3'"

      echo "services:"
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    build: './'"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "    image: $SELECTED_SCENARIO_DI_NAME"
      echo '    user: "${UID}:${GID}"'
      echo "    restart: unless-stopped"
      echo "    env_file: '.env'"
      echo "    ports:"
      echo "      - 8082:8082"
      echo "      - 8083:8083"
      echo "      - 8021:8021"
      echo "      - 7574:7688"
      echo "    volumes:"
      echo "      - \${structr_dir}/db/:/var/lib/structr/db/"
      echo "      - \${structr_dir}/files/:/var/lib/structr/files/"
      echo "      - \${structr_dir}/layouts/:/var/lib/structr/layouts/"
      echo "      - \${structr_dir}/logs/:/var/lib/structr/logs/"
      echo "      - \${structr_dir}/sessions/:/var/lib/structr/sessions/"
      echo "      - \${structr_dir}/snapshots/:/var/lib/structr/snapshots/"
      echo "      - \${files_dir}:/EAMD.ucp"
      echo "      - \${files_dir}/Components/tla/EAMD/UcpComponentSupport/1.0.0/src/sh:/var/lib/structr/scripts/"
      echo "    environment:"
      echo "      - PROXY_ADDRESS_FORWARDING=true"
      
      echo "networks:"
      echo "  default:"
      echo "    external:"
      echo "      name: once-woda-network"

    } >> docker-compose.yml

    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo

}

function once.dc.create.pg()
{
  once.dc.delete.pg

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi

    echo "Creating postgresql.env file"
    {
      echo "POSTGRES_USER=root"
      echo "POSTGRES_PASSWORD=qazwsx123"
      echo "POSTGRES_DB=oncestore"
      echo "APP_DB_USER=once"
      echo "APP_DB_PASS=qazwsx123"
      echo "APP_DB_NAME=oncestore"
    } >> postgresql.env
    echo 
    warn.log "postgresql.env file created..."
    cat postgresql.env
    echo 
      if [ ! -d "db.init" ]; then
        mkdir -p db.init
        cd db.init
        wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.2/db/01-init.sh
        chmod +x 01-init.sh
        cd ..
      fi

    {
      echo 'version: "3.7"'
      echo 'services:'
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "    image: $SELECTED_SCENARIO_DI_NAME"
      echo '    restart: always'
      echo '    env_file:'
      echo '      - postgresql.env'
      echo '    volumes:'
      
      echo '      - ./db.init:/docker-entrypoint-initdb.d/'
      echo '      - ./oncestore.db:/var/lib/postgresql/data'
      echo '    ports:'
      echo '      - "5433:5432"'
      echo  ''      
      echo  ''      
      echo 'networks:'
      echo '  default:'
      echo '    external:'
      echo '      name: once-woda-network'
    } >> docker-compose.yml

    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo
}

function once.dc.create.pgadmin()
{
  once.dc.delete.pgadmin

  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi

    if [ -f "pgAdmin.env" ]; then
      echo "pgAdmin.env file already exists...";
    else
    
      echo "Creating pgAdmin.env file"
      {
        echo "PGADMIN_DEFAULT_EMAIL=admin@admin.com"
        echo "PGADMIN_DEFAULT_PASSWORD=qazwsx123"
      } >> pgAdmin.env
      echo 
      echo "pgAdmin.env file created..."
      cat pgAdmin.env
      echo 

    fi
    if [ -f "docker-compose.yml" ]; then
      echo "docker-compose file already exists...";
    else

      {
        echo 'version: "3.7"'
        echo 'services:'
        echo "  $SELECTED_SCENARIO_NAME-service:"
        echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
        echo '    image: dpage/pgadmin4:4.18'
        echo '    restart: always'
        echo '    env_file:'
        echo '      - pgAdmin.env'
        echo '    volumes:'
            
        echo '      - pgadmin-data:/var/lib/pgadmin'
        echo '    ports:'
        echo '      - "8099:80"'
        echo '      - "7443:443"'
        echo  ''      
        echo  ''      
        echo 'volumes:'
        echo '  pgadmin-data:'
        echo 'networks:'
        echo '  default:'
        echo '    external:'
        echo '      name: once-woda-network'
      } >> docker-compose.yml

      echo 
      echo "docker-compose.yml file created..."
      cat docker-compose.yml
      echo
    fi
}

function once.dc.delete.woda()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME

    if [ -f "current.env" ]; then
      rm current.env
    fi

    if [ -f "./once.sh" ]; then
      rm ./once.sh
    fi

    if [ -f "docker-compose.yml" ]; then
      rm docker-compose.yml
    fi

    if [ -f "Dockerfile" ]; then
      echo "Dockerfile already exists........."
      rm Dockerfile
    fi
}

function once.dc.delete.woda2local()
{
    docker image rm $SELECTED_SCENARIO_DI_NAME
    docker container rm $SELECTED_SCENARIO_DC_NAME

    if [ -f "current.env" ]; then
      rm current.env
    fi

    if [ -f "./once.sh" ]; then
      rm ./once.sh
    fi

    if [ -f "docker-compose.yml" ]; then
      rm docker-compose.yml
    fi

    if [ -f "Dockerfile" ]; then
      echo "Dockerfile already exists........."
      rm Dockerfile
    fi
}
function once.dc.create.woda2local()
{
    once.dc.delete.woda2local
    NETWORK_NAME=once-woda-network
    if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
        echo "${NETWORK_NAME} not exists, creating new..."
        docker network create ${NETWORK_NAME} ; 
        echo "${NETWORK_NAME} docker network created."
        echo
        docker network connect ${NETWORK_NAME} $(hostname)
    else
      echo "Docker Network '${NETWORK_NAME}' Already Exists..."
    fi

    local domain=$1
    if [ -n "$ONCE_DEFAULT_HOST" ]; then
      domain=$ONCE_DEFAULT_HOST
    fi
    if [ -z $domain ]; then
        error.log "Domain Name Missing in the command.";
        exit;
    fi

    if [ -f "current.env" ]; then
      rm current.env
      echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
      export ONCE_DOCKER_HOST=$HOSTNAME
    else
      echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
      export ONCE_DOCKER_HOST=$HOSTNAME
    fi
    echo 
    echo "current.env file created..."
    cat current.env
    echo
    if [ ! -d "./init" ]; then
      # cp $(dirname $This)/once.sh ./
      mkdir -p ./init/
    else
      rm -r ./init/
      mkdir -p ./init/
      # cp $(dirname this)/once.sh ./
      #cp -r /var/dev/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/* ./once/
    fi
    cp $(which once) ./init/

    {
      echo "version: '3'"
      echo "services:"
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "    build: './'"
      echo "    image: $SELECTED_SCENARIO_DI_NAME"            
      echo "    env_file:"
      echo "      - current.env"
      echo "    ports:"
      echo "      - 8080:8080"
      echo "      - 8443:8443"
      echo "      - 5001:5001"
      echo "      - 5002:5002"
      echo "      - 5005:5005"
      echo "    volumes:"
      echo "      - $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/:/usr/local/sbin/"
      echo "      - $ONCE_REPO_PREFIX:$ONCE_REPO_PREFIX"
      echo "      - /var/run/docker.sock:/var/run/docker.sock"
      echo "    command: '/root/init/once startlog'"
      echo "networks:"
      echo "  default:"
      echo "    external:"
      echo "      name: once-woda-network"
    } >> docker-compose.yml
    
    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo


    echo "Creating Dockerfile......."
    {
      echo "# Pull base image."
      echo "FROM ubuntu:20.04"
      
      echo "ENV ONCE_DOCKER_HOST $HOSTNAME"

      echo "WORKDIR /root/"
      #echo "VOLUME  /var/dev/ /var/dev/"

      echo "ADD ./init/once ./init/once"
      echo "RUN chmod +x ./init/once"
      echo "RUN ./init/once docker.build $domain"
      # echo "RUN ./init/once init"

      echo "CMD [ "/bin/bash" ]"
      echo "# Expose ports."
      echo "EXPOSE 8080"
    } >> Dockerfile    
    #cp Dockerfile /va/dev/
    #cp -r init /var/dev/
    #cd /var/dev


    echo 
    echo "Dockerfile file created..."
    cat Dockerfile
    echo
}

function once.dc.create.woda()
{
    once.dc.delete.woda

    if [ -f "current.env" ]; then
      rm current.env
      echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
      export ONCE_DOCKER_HOST=$HOSTNAME
    else
      echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
      export ONCE_DOCKER_HOST=$HOSTNAME
    fi
    echo 
    echo "current.env file created..."
    cat current.env
    echo

    if [ ! -d "./once" ]; then
      # cp $(dirname $This)/once.sh ./
      mkdir -p ./once/
      cp -r /var/dev/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/* ./once/
    else
      rm -r ./once/
      mkdir -p ./once/
      # cp $(dirname this)/once.sh ./
      cp -r /var/dev/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/* ./once/
    fi
    # echo copied $(dirname $This)/once.sh tp $(pwd)



    {
      echo "version: '3'"
      echo "services:"
      echo "  $SELECTED_SCENARIO_NAME-service:"
      echo "    container_name: $SELECTED_SCENARIO_DC_NAME"
      echo "    build: './'"
      echo "    image: $SELECTED_SCENARIO_DI_NAME"            
      echo "    env_file:"
      echo "      - current.env"
      echo "    ports:"
      echo "      - 8080:8080"
      echo "      - 8443:8443"
      echo "      - 5001:5001"
      echo "      - 5002:5002"
      echo "      - 5005:5005"
      echo "    volumes:"
      # echo "      - $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/:/usr/local/sbin/"
      echo "      - $SELECTED_SCENARIO_NAME-volume:$ONCE_REPO_PREFIX"
      # echo "      - /var/run/docker.sock:/var/run/docker.sock"
      echo "    command: 'once startlog'"
      echo 'volumes:'
      echo "  $SELECTED_SCENARIO_NAME-volume:"      
      echo "networks:"
      echo "  default:"
      echo "    external:"
      echo "      name: once-woda-network"
    } >> docker-compose.yml
    
    echo 
    warn.log "docker-compose.yml file created..."
    cat docker-compose.yml
    echo


    echo "Creating Dockerfile......."
    {
      echo "# Pull base image."
      echo "FROM ubuntu:20.04"
      
      echo "ENV ONCE_DOCKER_HOST $HOSTNAME"

      echo "WORKDIR /root/"
      echo "ADD ./once/ /usr/local/sbin/"
      echo "ADD ./once/once.sh ./once.sh"
      echo "RUN chmod +x ./once.sh"
      echo "RUN ./once.sh docker.build"

      echo "CMD [ "/bin/bash" ]"
      echo "# Expose ports."
      echo "EXPOSE 8080"
    } >> Dockerfile    
    
    echo 
    echo "Dockerfile file created..."
    cat Dockerfile
    echo
}

once.deprecated.docker.build(){
  once.deprecated.docker.network
  if [ $1 = "pgadmin" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    docker-compose build
  elif [ $1 = "postgresql" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2/
    docker-compose build
  elif [ $1 = "woda" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/
    docker-compose build
  elif [ $1 = "all" ]; then
    once.deprecated.docker.build postgresql
    once.deprecated.docker.build pgadmin
    once.deprecated.docker.build woda
  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.build pgadmin'";
    echo "2. For PostgreSQL 'once docker.build postgresql'";
    echo "3. For WODA 'once docker.build woda'";
    echo
  fi

}

once.deprecated.docker.rebuild(){
  once.deprecated.docker.network
  if [ $1 = "pgadmin" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    docker-compose build --no-cache
  elif [ $1 = "postgresql" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2/
    docker-compose build --no-cache
  elif [ $1 = "woda" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/
    docker-compose build --no-cache
  elif [ $1 = "all" ]; then
    once.deprecated.docker.rebuild postgresql
    once.deprecated.docker.rebuild pgadmin
    once.deprecated.docker.rebuild woda
  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.rebuild pgadmin'";
    echo "2. For PostgreSQL 'once docker.rebuild postgresql'";
    echo "3. For WODA 'once docker.rebuild woda'";
    echo
  fi

}


once.deprecated.docker.start(){
  once.deprecated.docker.network
  if [ $1 = "pgadmin" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    if [ "$(docker inspect --format='{{.State.Running}}' once-pgadmin)" = "true" ]; then
      echo
      echo "pgAdmin Container is running....";
      echo
      echo "Entering in pgAdmin Container...";
      echo
      docker exec -it once-pgadmin sh
    else
      docker-compose up
    fi
  elif [ $1 = "postgresql" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2/
    # $result= "$(docker inspect --format="{{.State.Running}}" once-postgresql)
    if [ "$(docker inspect --format='{{.State.Running}}' once-postgresql)" = "true" ]; then
      echo
      echo "PostgreSQL Container is running....";
      echo
      echo "Entering in PostgreSQL Container...";
      echo
      docker exec -it once-postgresql bash
    else
      docker-compose up
    fi
    
  elif [ $1 = "woda" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/
    if [ "$(docker inspect --format='{{.State.Running}}' woda)" = "true" ]; then
      echo
      echo "WODA Container is running....";
      echo
      echo "Entering in WODA Container...";
      echo
      docker exec -it woda bash
    else
      docker-compose up
    fi
  elif [ $1 == "ssl" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/Nginx/1.15/Certbot/1.7.0/$2
    if [ "$(docker inspect --format='{{.State.Running}}' woda)" = "certbot" ]; then
      echo
      echo "Nginx & Cretbot Container is running....";
      echo
      docker exec -it certbot bash
    else
      docker-compose up
    fi
    
  elif [ $1 = "all" ]; then
    once.deprecated.docker.start postgresql
    once.deprecated.docker.start pgadmin
    once.deprecated.docker.start woda
  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.start pgadmin'";
    echo "2. For PostgreSQL 'once docker.start postgresql'";
    echo "3. For WODA 'once docker.start woda'";
    echo
  fi

}


once.deprecated.docker.restart(){
  if [ $1 = "pgadmin" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    once.deprecated.docker.stop pgadmin
    once.deprecated.docker.start pgadmin
  elif [ $1 = "postgresql" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2/
    once.deprecated.docker.stop postgresql
    once.deprecated.docker.start postgresql
  elif [ $1 = "woda" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/
    once.deprecated.docker.stop woda
    once.deprecated.docker.start woda
  elif [ $1 = "all" ]; then
    once.deprecated.docker.restart postgresql
    once.deprecated.docker.restart pgadmin
    once.deprecated.docker.restart woda
  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.restart pgadmin'";
    echo "2. For PostgreSQL 'once docker.restart postgresql'";
    echo "3. For WODA 'once docker.restart woda'";
    echo
  fi

}


once.deprecated.docker.stop(){
  if [ $1 = "pgadmin" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
    docker-compose down
  elif [ $1 = "postgresql" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2/
    docker-compose down
  elif [ $1 = "woda" ]; then
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/
    docker-compose down
  elif [ $1 = "all" ]; then
    once.deprecated.docker.stop woda
    once.deprecated.docker.stop pgadmin
    once.deprecated.docker.stop postgresql
  else
    echo 
    echo "No Docker config found with Name: '$1'";
    echo
    echo "Try one of the following commands...";
    echo "1. For pgAdmin 'once docker.stop pgadmin'";
    echo "2. For PostgreSQL 'once docker.stop postgresql'";
    echo "3. For WODA 'once docker.stop woda'";
    echo
  fi

}

function once.check.installation.mode() {
  #stop.log "once.check.installation.mode $COMMANDS"
  local mode=$@
  if [ -z "$mode" ]; then 
        console.log "once.check.installation.mode with no parameters!"
        mode=DOCKER
  fi

  case $mode in
    docker.build)
      console.log "once installation mode: $mode"
      export ONCE_BUILD=BUILDING
      warn.log "once is in mode: during Dockerfile build"
      return 0
      ;;
    LOCAL)
      console.log "once installation mode: $mode"
      ;;
    DOCKER)
      console.log "once installation mode: $mode"
      ;;      
  esac
  


}


once.init()                 # forces reinitialisation
{
  #stop.log "entered once.init"
  #export PS4='+${LINENO}: '
  #clear
  unset NEW
  once.version
  stop.log "check installation mode"
  once.check.installation.mode "$@"

  console.log "initialize Once"


  #wo-da.de IP for once.update
  ONCE_DEFAULT_SSH_IP=178.254.36.232
  
  #for once.load
  #ONCE_LOCAL_SERVER=http://192.168.178.49:8080
  
  ONCE_DEFAULT_HOST=test.wo-da.de
  ONCE_SHELL=$SHELL
  #ONCE_USERHOME=$(cd;pwd)

  ONCE_REPO_PREFIX=/var/dev
  ONCE_REPO_NAME=EAMD.ucp
  ONCE_REPO_COMPONENTS=Components
  ONCE_REPO_SCENARIOS=Scenarios
  
  if [ -z "$ONCE_INITIAL_PATH" ]; then
    console.log "saving inital PATH"
    ONCE_INITIAL_PATH=$PATH
  fi

  ONCE_LATEST_BRANCH=test/sprint28
  #ONCE_SCENARIO_BRANCH=prod/WODA
  #ONCE_SCENARIO_BRANCH=prod/Scenarios/com/shiftphones/shifter
  ONCE_SCENARIO_BRANCH=test/sprint28


  ONCE_REVERSE_PROXY_CONFIG='[["auth","test.wo-da.de"],["snet","test.wo-da.de"],["structr","test.wo-da.de"]]'
  ONCE_REV_PROXY_HOST=127.0.0.1
  ONCE_REV_PROXY_PORT=5002
  ONCE_REV_PROXY_HTTPS_PORT=5005
  
  ONCE_PROXY_HOST=127.0.0.1
  ONCE_PROXY_PORT=5001





  #stepDebugger ON
  #once.check.privileges
  
  if [ -n "$1" ]; then
    ONCE_REPO_PREFIX=$1
    console.log "custom.installation: at $ONCE_REPO_PREFIX"
    ONCE_STATE=user.installation
  fi
  once.cmd update
 
  warn.log "all environment variables newly initialized"
  
  #once.stage
}

function once.update.variables()     # updates the environmental variables: REPO_DIR, COMPONENTS_DIR, SCENARIOS_DIR, ONCE_DIR, ONCE_DEFAULT_SCENARIO, ONCE_LOAD_DIR
{
  #stop.log "update Variables:"

  export REPO_DIR=$ONCE_REPO_PREFIX/$ONCE_REPO_NAME
  export COMPONENTS_DIR=$REPO_DIR/$ONCE_REPO_COMPONENTS
  export SCENARIOS_DIR=$REPO_DIR/$ONCE_REPO_SCENARIOS
  ONCE_DIR=$COMPONENTS_DIR/tla/EAM/layer1/Thinglish/Once/latestServer

  if [ -z "$ONCE_SCENARIO" ]; then
      stop.log "setting NEW ONCE_SCENARIO"
      ONCE_SCENARIO=$SCENARIOS_DIR/localhost
  fi 


  if [ ! -d "$ONCE_SCENARIO" ]; then 
    warn.log "no scenario, using localhost and creating dir: $ONCE_SCENARIO"
    once.path.create $ONCE_SCENARIO
  fi

  ONCE_DEFAULT_SCENARIO=$ONCE_SCENARIO/EAM/1_infrastructure/Once/latestServer
  
  ONCE_LOAD_DIR=$SCENARIOS_DIR/localhost/EAM/1_infrastructure/Once/latestServer/oosh

  if [ -z "$ONCE_STRUCTR_SERVER" ]; then 
    console.log "no default ONCE_STRUCTR_SERVER"
    # ONCE_STRUCTR_SERVER=https://$ONCE_DEFAULT_HOST:$ONCE_REV_PROXY_HTTPS_PORT
    ONCE_STRUCTR_SERVER=https://test.wo-da.de:8083
    console.log "  setting: $ONCE_STRUCTR_HOST"
  fi

  # if [ -z "$ONCE_DEFAULT_HOST" ] ; then
  #   ONCE_DEFAULT_HOST=$ONCE_DEFAULT_SERVER
  #   warn.log "ONCE_DEFAULT_SERVER is deprecated: pleas usee ONCE_DEFAULT_HOST or ONCE_DEFAULT_URL instead"
  # fi

  #if [ -z "$ONCE_DEFAULT_SERVER" ] ; then
    #ONCE_DEFAULT_SERVER=$ONCE_DEFAULT_HOST
    #warn.log "ONCE_DEFAULT_SERVER is deprecated: please use ONCE_DEFAULT_HOST instead"
  #fi
  
  if [ -z "$ONCE_DEFAULT_URL" ] ; then
    ONCE_DEFAULT_URL=https://$ONCE_DEFAULT_HOST
  fi
  
  if [ -z "$ONCE_POSTGRES_CONNECTION_STRING" ] ; then
    ONCE_POSTGRES_CONNECTION_STRING=postgresql://root:qazwsx123@once-postgresql:5433/oncestore
  fi

  if [ -z "$ONCE_DIRECT_HTTPS_URL" ] ; then
    ONCE_DIRECT_HTTPS_URL=https://$ONCE_DEFAULT_HOST:8443
  fi


  # if [ -z "$ONCE_DEFAULT_DOCKER_POSTGRESQL" ] ; then
  #   export ONCE_DEFAULT_DOCKER_POSTGRESQL=$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.2/
  # fi

  # if [ -z "$ONCE_DEFAULT_DOCKER_WODA" ] ; then
  #   export ONCE_DEFAULT_DOCKER_WODA=$ONCE_REPO_PREFIX/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/DockerWorkspaces/WODA/2.0.0/Ubuntu/20.04/Nodejs/16
  # fi
  
  # if [ -z "$ONCE_DEFAULT_SCENARIO_DOCKER" ] ; then
  #   warn.log "please refactor....deprecated....see once sceanrio.check"
  #   export ONCE_DEFAULT_SCENARIO_DOCKER="${ONCE_DEFAULT_SCENARIO:0:${#ONCE_DEFAULT_SCENARIO}-17}"
  # fi

  if [ -z "$ONCE_DEFAULT_UDE_STORE" ] ; then
    ONCE_DEFAULT_UDE_STORE=https://localhost:8443
  fi

  if [ -z "$ONCE_DEFAULT_KEYCLOAK_SERVER" ] ; then
    export ONCE_DEFAULT_KEYCLOAK_SERVER='{ "realm": "master", "clientId": "shifternetzwerk", "testClient": { "client_id": "mochaAPI", "client_secret": "df37971a-f098-4310-8a62-b238b15c7b35" , "mocha1id": "42b8c48b-34d6-4a33-8c93-5e3782c05a48", "mocha2id": "ccfff6f6-7764-4111-98f3-6bf68d8e4b26", "mocha3id": "92746ce6-d5ce-4127-9e45-30fef19cf7a6" }, "url": "https://test.wo-da.de/auth"}'
  fi

  export ONCE_DIR
  checkAndFix  "default ONCE_LOAD_DIR location" "-d" "$ONCE_LOAD_DIR" "once.path.create $ONCE_LOAD_DIR"

  ONCE_PATHS=$ONCE_DEFAULT_SCENARIO/paths

  #stop.log "writing NEW $ONCE_DEFAULT_SCENARIO/.once"
  #set | grep "^\(export \)*ONCE_" | sed 's/^\(export \)*\(ONCE_\)\(.*\)=\(.*\)/export \2\3=\4/' >$ONCE_DEFAULT_SCENARIO/.once

  warn.log "updating $ONCE_DEFAULT_SCENARIO/.once"
  set | grep "^\(export \)*ONCE_EXPORT_" | sed 's/^\(export \)*\(ONCE_EXPORT_\)\(.*\)/export \3/' >./tmp.once.export.env
  cat ./tmp.once.export.env
  source ./tmp.once.export.env
  rm ./tmp.once.export.env
}


once.unset() 
{
  export TMP_SCENARIO=$ONCE_DEFAULT_SCENARIO
  set | grep "^\(export \)*ONCE_" | sed 's/^\(export \)*\(ONCE_\)\(.*\)=\(.*\)/unset \2\3/' >tmp.once.clear.env
  source tmp.once.clear.env
  rm tmp.once.clear.env
  export ONCE_DEFAULT_SCENARIO=$TMP_SCENARIO
  unset TMP_SCENARIO

  #grep "^\(export \)*ONCE_" $ONCE_DEFAULT_SCENARIO/.once | sed 's/^\(export \)*\(ONCE_\)\(.*\)=\(.*\)/\1\2\3=\4/' 
  stop.log "updating $ONCE_DEFAULT_SCENARIO/.once"
  grep "^\(export \)*ONCE_" $ONCE_DEFAULT_SCENARIO/.once | sed 's/^\(export \)*\(ONCE_\)\(.*\)=\(.*\)/export \2\3=\4/' 
  #exit
  grep "^\(export \)*ONCE_" $ONCE_DEFAULT_SCENARIO/.once | sed 's/^\(export \)*\(ONCE_\)\(.*\)=\(.*\)/export \2\3=\4/'  >$ONCE_DEFAULT_SCENARIO/.once.new
  
  #echo export ONCE_DEFAULT_SCENARIO=$ONCE_DEFAULT_SCENARIO >~/.once
  # echo . $ONCE_DEFAULT_SCENARIO/.once >>~/.once
  # echo PATH=$PATH >>~/.once

  stop.log "list current new: $ONCE_DEFAULT_SCENARIO/.once"
  cat $ONCE_DEFAULT_SCENARIO/.once.new


  if [ -n "$OOSH_PATH" ]; then
    warn.log "restart shell with the new config"
    exit $ERROR_CODE_RECONFIG
  else
    warn.log "entering shell with the new config"
    once.shell
  fi

}

function once.stage()                # transitions to the next state of th ONCE STATE MACHINE and saves it for recovery
{
  debug.log "once.stage: -$1- COMMANDS=-$COMMANDS- RETURN=-$RETURN- @=-$@-"
  
  if [ -n "$1" ]; then
	  ONCE_STATE=$1
    once.hibernate update
  fi
  if [ "$ONCE_STATE" = "stage" ] ; then
	  ONCE_STATE=status
    once.stage
    return
  fi
  if [ -z "$ONCE_STATE" ] ; then
	  ONCE_STATE=discover
  fi
  #test -t 1 && tput bold; tput setf 6                                    ## white yellow
  echo -e "\e[1;96mOnce transition to: $ONCE_STATE\e[0m"
  #test -t 1 && tput sgr0 # Reset terminal
  shift
  debug.log "next arguments: $@"

  #if [ "ON" = "$DEBUG" ]; then 
  #  stepDebugger ON
  #fi
  stop.log "docker.build check"
  once.$ONCE_STATE "$@"
  if [ "$?" = "0" ]; then
    return $?
  else
    err.log "$?"
    once.stage done
  fi
}


function once.hibernate()            # save environmental variables and puts once in hibernation 
{

  #writes all ONCE_ env variables to .once in the users home directroy
  #if [ -n "$ONCE_SCENARIO" ]; then
  #  ONCE_DEFAULT_SCENARIO=$ONCE_SCENARIO/EAM/1_infrastructure/Once/latestServer
  #fi

	#set | grep ^ONCE_ >$ONCE_DEFAULT_SCENARIO/.once
  #set | grep ^ONCE_ | sed 's/^\(ONCE_\)\(.*\)=\(.*\)/unset \1\2/' >$ONCE_DEFAULT_SCENARIO/.once
  

  set | grep "^\(export \)*ONCE_" | sed 's/^\(export \)*\(ONCE_\)\(.*\)=\(.*\)/export \2\3=\4/' >$ONCE_DEFAULT_SCENARIO/.once

  echo export ONCE_DEFAULT_SCENARIO=$ONCE_DEFAULT_SCENARIO >~/.once
  echo . \$ONCE_DEFAULT_SCENARIO/.once >>~/.once
  echo PATH=$PATH >>~/.once
  
  if [ -z "$1" ]; then
    console.log "hibernating once.sh"
    exit 0
  fi
}

function once.shell()     # enters a new shell with the current once config in the directory provided as 1st parameter
{
  stop.log "entering once shell level $(($SHLVL/2+1))"  #whitespace is totally important
  if [ -n "$1" ]; then
    cd "$1"
  fi
  shopt -s histappend
  PROMPT_COMMAND='history -a;history -n '
  bash
  stop.log "back to once shell level $(($SHLVL/2))"
  if [ $SHLVL == 2 ]; then
      console.log "bottom reached .... do not exit the shell again"
  fi
}

# function once.shell.exit()                           # exits until at shell level 1 
# {
#     if [ $SHLVL == 2 ]; then
#       stop.log "back to once shell level $SHLVL"
#       console.log "bottom reached .... not exiting shell"
#       return      
#     else
#       stop.log "back to once shell level $SHLVL"
#       exit
#     fi
#     source $ONCE_DEFAULT_SCENARIO/.once
# }

once.mode()                 # sets the mode to either LOCAL or DOCKER and defines if "once start" tries to use local npm oder npm in a docker container
{
    if [ -z "$ONCE_MODE" ]; then 
      ONCE_MODE=LOCAL
    fi

    if [ -z "$1" ]; then 
        console.log "ONCE MODE: $ONCE_MODE"
        once.stage done
        return
    fi
    once.server.stop
    console.log "set ONCE MODE to: $1"
    ONCE_MODE=$1
    shift
    RETURN=$1
    once.stage done
}

once.restart()
{
  once.server.stop
  once.server.start fast
}

once.test()
{
  once.server.stop
  cd $ONCE_DIR
  npm install
  npm test
}

once.start()                # starts the Once Server in the background and remembers its PID; that is if no ohter instance of once is running (the forceful start of another once server is on a dynamic port counting upward from 8080)
{
  COMMANDS="$@"
  if [ "$1" = "completion.discover" ]; then 
    shift
    once.completion.discover "$@"
  fi
  #echo checking $1
  if [[ "$1" == *completion ]]; then 
    #echo completion found
    source ~/.once
    { 
      once.update.variables 
    } >/dev/null
    #LOG_LEVEL=6
    local command=$1
    shift
    once.$command "$@"
    exit $?
  # else
  #  echo no completion
  fi
  #stop.log "once.discover $COMMANDS"
  once.discover "$@"
  if [ -z "$1" ]; then 
        console.log "no parameters! stage to: $ONCE_STATE"
        once.stage
        console.log "$this: Bye"
        
        once.done
  fi

  while [ -n $1 ]; do
    debug.log "start 1: -$1-"
    case $1 in
      call)
        shift
        "$@"
        ;;
      discover)
        once.discover
        if [ "$ONCE_STATE" = "disvocer" ]; then
          ONCE_STATE=check.installation
          once.stage
        fi
        ;;
      start)
        stop.log "once start"
        once.server.start "$@"
        ;;
      X)
        echo "Set DEBUG to X"
        shift
        echo "RETRUN $1"
        RETURN=$1
        ;;
      '')
        debug.log "$0: EXIT"
        #exit 0
        return
        ;;
      *)
        console.log "once.stage to: $@"
        once.stage "$@"
    esac

    while [ ! "$RETURN" = "$1" ]; do
      shift
      debug.log "shift:  -Return:$RETURN-  -$1- -command=$COMMANDS-  =$@="
      if [ -z "$1" ]; then
        debug.log "force stop"
        RETURN=
        exit 0
      fi
    done
    debug.log "found RETURN=$1"
    RETURN=$2
    
  done
  debug.log "will stage"
  once.stage $ONCE_STATE
  
}


once.woda2local.update() {
  docker cp -L /root/init/once woda2local:/root/init/once
}

function once.startlog(){
  echo "tailing up the image"
  # tail -f ~/.bashrc
  
  if [ -z "$ONCE_SERVER_PID" ]; then
    once.server.stop
  fi

  # once.unset
  # once.init
  # once.update.variables
  # once.hibernate update

  once.bind.docker

  once.status
  
  docker network connect once-woda-network $(hostname)

  ONCE_SERVER_PID=
  once.server.start.inDocker
  # once.links.fix
  once.log

}

function once.deprecated.docker.network(){
  once.check.install docker
  once.check.install docker-compose
  echo "Checking Docker Network Status..."
  NETWORK_NAME=once-woda-network
  if [ -z $(docker network ls --filter name=^${NETWORK_NAME}$ --format="{{ .Name }}") ] ; then 
      echo "${NETWORK_NAME} not exists, creating new..."
      docker network create ${NETWORK_NAME} ; 
      echo "${NETWORK_NAME} docker network created."
      echo
      docker network connect ${NETWORK_NAME} $(hostname)
  else
    echo "Docker Network '${NETWORK_NAME}' Already Exists..."
  fi
}

# once.clone.3rdpartycomponents(){

# }

function once.check.install(){
  if ! [ -x "$(command -v $1)" ]; then
    echo 
    echo 'Error: Required Package is not installed.' >&2
    once.double.line
    echo "Trying to install....."
    once.docker.install
    once.double.line
    
  fi
}

function once.deprecated.docker.folder.check(){
    checkAndFix  "default Docker Sceanrios location ONCE_SCENARIO/EAM/1_infrastructure/Docker" "-d" "$ONCE_SCENARIO/EAM/1_infrastructure/Docker" "once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker"
}

function once.deprecated.docker.pgadmin.createdc(){
  once.deprecated.docker.folder.check
  cd ${ONCE_SCENARIO}/EAM/1_infrastructure/Docker/
  if [ -d "./pgAdmin" ]; then
    echo "pgAdmin Directory in Scenario Default Location exists....";
  else
    echo "Creating 'pgAdmin/' directory In Scenario Default Location.....";
    mkdir -p pgAdmin
    mkdir -p pgAdmin/4.18/    
  fi
  cd pgAdmin/4.18/
  if [ -f "pgAdmin.env" ]; then
    echo "pgAdmin.env file already exists...";
  else
  

    echo "Creating pgAdmin.env file"
    echo "PGADMIN_DEFAULT_EMAIL=admin@admin.com" >> pgAdmin.env
    echo "PGADMIN_DEFAULT_PASSWORD=qazwsx123" >> pgAdmin.env
    echo 
    echo "pgAdmin.env file created..."
    cat pgAdmin.env
    echo 

  fi
  if [ -f "docker-compose.yml" ]; then
    echo "docker-compose file already exists...";
  else
  
    echo 'version: "3.7"' >> docker-compose.yml
    echo 'services:' >> docker-compose.yml
    echo '  pgadmin:' >> docker-compose.yml
    echo '    container_name: once-pgadmin' >> docker-compose.yml
    echo '    image: dpage/pgadmin4:4.18' >> docker-compose.yml
    echo '    restart: always' >> docker-compose.yml
    # echo '    hostname: postgresql-db.docker.local' >> docker-compose.yml
    echo '    env_file:' >> docker-compose.yml
    echo '      - pgAdmin.env' >> docker-compose.yml
    echo '    volumes:' >> docker-compose.yml
        
    echo '      - pgadmin-data:/var/lib/pgadmin' >> docker-compose.yml
    echo '    ports:' >> docker-compose.yml
    echo '      - "8099:80"'  >> docker-compose.yml
    echo '      - "7443:443"'  >> docker-compose.yml
    # echo '    links:' >> docker-compose.yml
    # echo '      - "postgresql-db-12"'  >> docker-compose.yml
    echo  ''      >> docker-compose.yml
    echo  ''      >> docker-compose.yml
    echo 'volumes:' >> docker-compose.yml
    echo '  pgadmin-data:' >> docker-compose.yml
    # echo '  pgadmin-data:' >> docker-compose.yml
    echo 'networks:' >> docker-compose.yml
    echo '  default:' >> docker-compose.yml
    echo '    external:' >> docker-compose.yml
    echo '      name: once-woda-network' >> docker-compose.yml

  fi
  
  echo 
  echo ".env file created with details:"
  echo
  cat pgAdmin.env
  echo 
  echo "docker-compose file created with details:"
  echo
  cat docker-compose.yml
  tree
}

function once.deprecated.docker.pgadmin.recreatedc(){
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker
  rm -r ./pgAdmin
  once.deprecated.docker.pgadmin.createdc
}

function once.deprecated.docker.postgresql.recreatedc(){
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker
  rm -r ./PostgreSQL
  once.deprecated.docker.postgresql.createdc
}

function once.deprecated.docker.postgresql.createdc(){
  once.deprecated.docker.folder.check
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker
  if [ -d "./PostgreSQL" ]; then
    echo "PostgreSQL Directory in Scenario Default Location exists....";
  else
    echo "Creating 'PostgreSQL/' directory In Scenario Default Location.....";
    mkdir -p PostgreSQL
    mkdir -p PostgreSQL/12.2/    
  fi
  cd PostgreSQL/12.2/
  if [ -f "postgresql.env" ]; then
    echo "postgresql.env file already exists...";
  else
    echo "Creating postgresql.env file"
    echo "POSTGRES_USER=root" >> postgresql.env
    echo "POSTGRES_PASSWORD=qazwsx123" >> postgresql.env
    echo "POSTGRES_DB=oncestore" >> postgresql.env
    echo "APP_DB_USER=once" >> postgresql.env
    echo "APP_DB_PASS=qazwsx123" >> postgresql.env
    echo "APP_DB_NAME=oncestore" >> postgresql.env
    echo 
    echo "postgresql.env file created..."
    cat postgresql.env
    echo 

  fi
  if [ -f "docker-compose.yml" ]; then
    echo "docker-compose file already exists...";
  else
    echo 'version: "3.7"' >> docker-compose.yml
    echo 'services:' >> docker-compose.yml
    echo '  postgresql-db-12:' >> docker-compose.yml
    echo '    container_name: once-postgresql' >> docker-compose.yml
    echo '    image: postgres:12.2' >> docker-compose.yml
    echo '    restart: always' >> docker-compose.yml
    # echo '    hostname: postgresql-db.docker.local' >> docker-compose.yml
    echo '    env_file:' >> docker-compose.yml
    echo '      - postgresql.env' >> docker-compose.yml
    echo '    volumes:' >> docker-compose.yml
    if [ ! -d "db.init" ]; then
      mkdir -p db.init
      cd db.init
      wget https://test.wo-da.de/EAMD.ucp/3rdPartyComponents/org/postgresql/PostgreSQL/12.2/db/01-init.sh
      chmod +x 01-init.sh
      cd ..
    fi
    
    echo '      - ./db.init:/docker-entrypoint-initdb.d/' >> docker-compose.yml
    echo '      - ./oncestore.db:/var/lib/postgresql/data' >> docker-compose.yml
    echo '    ports:' >> docker-compose.yml
    echo '      - "5433:5432"'  >> docker-compose.yml
    echo  ''      >> docker-compose.yml
    echo  ''      >> docker-compose.yml
    #echo 'volumes:' >> docker-compose.yml
    # echo '  db-data:' >> docker-compose.yml
    # echo '  pgadmin-data:' >> docker-compose.yml
    echo 'networks:' >> docker-compose.yml
    echo '  default:' >> docker-compose.yml
    echo '    external:' >> docker-compose.yml
    echo '      name: once-woda-network' >> docker-compose.yml

  fi
  # pwd
  # ls -AlF
  echo 
  echo "docker-compose file created with config details:"
  echo
  cat docker-compose.yml
  ls -AlF
  
}

once.deprecated.docker.dc.setup() #to setup PostgreSQL, pgAdmin & WODA docker in default scenario
{

  echo "Creating Docker Network......"
  echo "==================================================================="
  once.deprecated.docker.network
  echo "Creating Scenerio Default Docker Directory......"
  echo "==================================================================="
  once.deprecated.docker.folder.check
  echo "Creating PostgreSQL docker config files......"
  echo "==================================================================="
  once.deprecated.docker.postgresql.createdc
  echo "Building PostgreSQL docker config files......"
  echo "==================================================================="
  once.deprecated.docker.postgresql.build
  echo "Creating pgAdmin docker config files......"
  echo "==================================================================="
  once.deprecated.docker.pgadmin.createdc
  echo "Building pgAdmin docker config files......"
  echo "==================================================================="
  once.deprecated.docker.pgadmin.build
  echo "Creating WODA docker config files......"
  echo "==================================================================="
  once.deprecated.docker.woda.createdc
  echo "Building WODA docker......"
  echo "==================================================================="
  # once.deprecated.docker.woda.build
  echo "Docker Build Completed....";
  echo "==================================================================="
}

function once.deprecated.docker.pgadmin.build(){
  once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep once-pgadmin 
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
  else
    echo "Container is not runing...";
    echo "Building container...";
    docker-compose build
  fi
}

function once.deprecated.docker.pgadmin.rebuild(){
  once.deprecated.docker.pgadmin.stop
  once.deprecated.docker.postgresql.recreatedc
  once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep once-pgadmin 
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
  else
    echo "Container is not runing...";
    echo "Building container...";
    docker-compose build --no-cache
  fi
}

function once.deprecated.docker.pgadmin.start(){
  once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep once-pgadmin 
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
    echo "Entering in container...";
    docker exec -it once-pgadmin sh
  else
    echo "Container is not runing...";
    echo "Building container...";
    docker-compose up
  fi
}



function once.deprecated.docker.postgresql.build(){
  once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep once-postgresql 
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
  else
    echo "Container is not runing...";
    echo "Building container...";
    docker-compose build
  fi
}

function once.deprecated.docker.postgresql.rebuild(){
  once.deprecated.docker.postgresql.stop
  once.deprecated.docker.postgresql.recreatedc
  once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2
  docker-compose ps --services --filter "status=running" | grep once-postgresql 
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
  else
    echo "Container is not runing...";
    echo "Building container...";
    docker image rm postgres:12.2
    rm -r ./oncestore.db
    docker-compose up --build --force-recreate -d
  fi
}


function once.deprecated.docker.postgresql.start(){
  once.deprecated.docker.network
  once.deprecated.docker.postgresql.createdc
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2
  
  docker-compose ps --services --filter "status=running" | grep once-postgresql 
  export status=$?
  if [ $status = 1 ]; then
    echo "Container is runing...";
    echo "Entering in container...";
    docker exec -it once-postgresql bash
  else
    echo "Container is not runing...";
    echo "Starting container...";
    docker-compose up -d
  fi
}





function once.get_current_env(){
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  if [ -f "current.env" ]; then
    rm current.env
  else
    echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
    export ONCE_DOCKER_HOST=$HOSTNAME
  fi
}

function once.copy_once_to_default_woda_docker(){
  if [ -f "$ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/once.sh" ]; then
    rm $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0/once.sh
  fi
  cp $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
}

function once.deprecated.docker.woda.recreatedc(){
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/
  rm -r ./WODA
  once.deprecated.docker.woda.createdc
}

function once.deprecated.docker.woda.createdc(){
  # once.deprecated.docker.folder.check
  once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  # if [ -d "./WODA" ]; then
  #   echo "WODA Directory in Scenario Default Location exists....";
  # else
  #   echo "Creating 'WODA/' directory In Scenario Default Location.....";
  #   mkdir -p WODA
  #   mkdir -p WODA/4.3.0    
  #   #once.path.create $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  # fi
  # cd WODA/4.3.0
  if [ -f "current.env" ]; then
    rm current.env
  fi
  echo ONCE_DOCKER_HOST=$HOSTNAME >> current.env
  export ONCE_DOCKER_HOST=$HOSTNAME
  cat current.env
  if [ ! -f "once.sh" ]; then
      cp $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/once.sh ./
  fi
  if [ -f "docker-compose.yml" ]; then
    echo "docker-compose file already exists...";
  else
    echo "version: '3'" >> docker-compose.yml

    echo "services:" >> docker-compose.yml
    echo "  woda-with-nodejs:" >> docker-compose.yml
    echo "    container_name: woda" >> docker-compose.yml
    echo "    build: './'" >> docker-compose.yml
    echo "    image: woda-nodejs:16.x" >> docker-compose.yml
        
    echo "    env_file:" >> docker-compose.yml
    echo "      - current.env" >> docker-compose.yml
    echo "    ports:" >> docker-compose.yml
    echo "      - 8080:8080" >> docker-compose.yml
    echo "      - 8443:8443" >> docker-compose.yml
    echo "      - 5001:5001" >> docker-compose.yml
    echo "      - 5002:5002" >> docker-compose.yml
    echo "      - 5005:5005" >> docker-compose.yml
    echo "    volumes:" >> docker-compose.yml
    echo "      - $ONCE_REPO_PREFIX/EAMD.ucp/Components/tla/EAM/layer1/Thinglish/Once/latestServer/src/sh/:/usr/local/sbin/" >> docker-compose.yml
#    echo "      - $ONCE_REPO_PREFIX/EAMD.ucp:$ONCE_REPO_PREFIX/EAMD.ucp" >> docker-compose.yml
    echo "      - /var/run/docker.sock:/var/run/docker.sock" >> docker-compose.yml
    echo "    command: 'once startlog'" >> docker-compose.yml
    echo "networks:" >> docker-compose.yml
    echo "  default:" >> docker-compose.yml
    echo "    external:" >> docker-compose.yml
    echo "      name: once-woda-network" >> docker-compose.yml
    cat docker-compose.yml
    
  fi
  if [ -f "Dockerfile" ]; then
    echo "Dockerfile already exists........."
  else
    echo "Creating Dockerfile......."
    echo "# Pull base image." >> Dockerfile
    echo "FROM ubuntu:20.04" >> Dockerfile
    
    echo "ENV ONCE_DOCKER_HOST $HOSTNAME" >> Dockerfile

    echo "WORKDIR /root/" >> Dockerfile
    echo "ADD ./once.sh ./once.sh" >> Dockerfile
    echo "RUN chmod +x ./once.sh" >> Dockerfile
    echo "RUN ./once.sh docker.build" >> Dockerfile
    # echo "RUN ./once.sh init" >> Dockerfile
    # echo "RUN ./once.sh links.fix" >> Dockerfile
    # RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -

    echo "CMD [ "/bin/bash" ]" >> Dockerfile
    echo "# Expose ports." >> Dockerfile
    echo "EXPOSE 8080" >> Dockerfile    
    cat Dockerfile
    ls
    pwd
  fi
}

function once.deprecated.docker.woda.build(){
  once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  docker-compose ps --services --filter "status=running" | grep woda
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
  else      
    once.copy_once_to_default_woda_docker
    # once.get_current_env
    docker-compose build
  fi
}


function once.deprecated.docker.woda.rebuild(){
  once.deprecated.docker.network
  unset ONCE_DEFAULT_SCENARIO
  unset SCENARIOS_DIR
  once.scenario.fix

  once.scenario.map woda

  once.deprecated.docker.woda.recreatedc
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  docker-compose ps --services --filter "status=running" | grep woda
  export status=$?
  if [ $status = 0 ]; then
    echo "Container is runing...";
  else
    once.copy_once_to_default_woda_docker
    # once.get_current_env
    docker-compose up --build --force-recreate
  fi
  
}

function once.deprecated.docker.woda.start(){
  once.deprecated.docker.network
  once.deprecated.docker.woda.createdc
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep woda
  export status=$?
  if [ $status = 0 ]; then
      echo "Container Already Runing...";
      echo "Entering Docker ...."
      docker exec -it woda bash
  else
    once.copy_once_to_default_woda_docker
    # once.get_current_env
    # pwd

    #docker network connect once-woda-network $(hostname)
    once.deprecated.docker.postgresql.start
    cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
    docker-compose up
  fi
  
}



once.deprecated.docker.postgresql()  #to setup postgresql docker in default scenerio
{
  once.deprecated.docker.postgresql.createdc
  once.deprecated.docker.postgresql.build
  once.deprecated.docker.postgresql.start
}

function once.deprecated.docker.postgresql.stop(){
  # once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/PostgreSQL/12.2
  docker-compose ps --services --filter "status=running" | grep once-postgresql 
  export status=$?
  if [ $status = 1 ]; then
    echo "Container is runing...";
    docker-compose down
  else
    echo "Container is not runing...";
  fi
}

once.deprecated.docker.pgadmin() #to setup pgAdmin docker in default scenerio
{
  once.deprecated.docker.pgadmin.createdc
  once.deprecated.docker.pgadmin.build
  once.deprecated.docker.pgadmin.start
}

function once.deprecated.docker.pgadmin.stop(){
  # once.deprecated.docker.network
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/pgAdmin/4.18/
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep once-pgadmin 
  export status=$?
  if [ $status = 0 ]; then
    echo "Stoping Docker Container is runing...";
    docker-compose down
  else
    echo "Container is not runing...";
  fi
}

once.deprecated.docker.woda()  #to setup WODA docker in default scenerio
{
  once.scenario.check
  once.deprecated.docker.woda.createdc
  once.deprecated.docker.woda.build
  once.deprecated.docker.woda.start
}

function once.deprecated.docker.woda.stop(){
  cd $ONCE_SCENARIO/EAM/1_infrastructure/Docker/WODA/4.3.0
  echo "Checking docker status...."
  docker-compose ps --services --filter "status=running" | grep woda
  export status=$?
  if [ $status = 0 ]; then
      echo "Container Runing...";
      echo "Stopping woda docker container...."
      docker-compose down
  else
      echo "Docker Container is not running..."
  fi
  once.deprecated.docker.postgresql.stop
}

once.docker.stop.all() {
  docker ps | tr -s ' ' | cut -d\  -f1 | xargs docker stop
}

function once.1() {
  console.log "hello ${FUNCNAME[0]} ..."
  
  echo "$1 should be \"a\"" 
  a=$1 
  shift
  b=$1
  echo "$1 should be \"b\""
  shift
  c=$1
  echo "$1 should be \"c\""
  shift

  RETURN=$1

}
function once.2() {
  debug.log "hello ${FUNCNAME[0]} ..."
  echo "$1 should be \"d\""
  shift
  echo "$1 should be \"e\""
  shift
  RETURN=$1
}
function once.3() {
  console.log "hello ${FUNCNAME[0]} ..."
  echo "$1 should be \"f\""
  shift
  echo "$1 should be \"g\""
  shift
  RETURN=$1
}

function once.4() {
  grep -w '$1' /root/scripts/once
  export st=$?
  if [ $st = 1 ] && [ $1 != 'cmd']; then
    once $1
    shift
  else
    once cmd $1
    shift
  fi
  RETURN=$1
}







function once.double.line(){
  echo 
  echo "================================================================================"
  echo
}


once.users.list () #To List All System Users
{
    cd /home/
    i=1;
    declare -a array;
    array[ 0 ]="root"
    for userName in $(ls); do
        if [ -f "./$userName/.profile" ]; then
            array[ $i ]=$userName;
            ((i++))
        fi
    done
    once.double.line 
    echo "List Of System Users: "
    echo 
    count=1;
    for i in "${array[@]}"
    do 
        echo "$count. $i";
        ((count++))
    done
    once.arrayToStr ${array[@]}
  once.double.line
}

function once.user.new () # To Add New User With Home Directory
{
  
  if [ -z $1 ]; then
    once.double.line
    echo "Please Specify New Username:........."
    echo "e.g once add.new.user {username}"
    once.double.line
  else
    once.users.list
    once.strToArray "$arrayString"
    i=0;
    for userName in "${array[@]}"
    do 
        
        if [ "$userName" = "$1" ]; then          
          
          ((i++))        
        fi

    done
    if [ $i -eq 1 ]; then
      echo "$1 User Already exists....";                
      # once.double.line
    else
      echo  "Creating New User With Username $1";
      if [ "$(whoami)" = "root" ]; then
        useradd -m -G sudo $1
        passwd $1
        array[ $i ]=$1;
      else
        echo 
        echo "Root Login required to setup new user...."                
        # once.double.line
      fi
    fi
    once.users.list
  fi
}


function once.arrayToStr(){
    array=($@)

    arrayString=""
    for (( i=0; i<${#array[@]}; i++ )); do
        if [[ $i == 0 ]]; then
            arrayString="\"${array[i]}\""
        else
            arrayString="${arrayString} \"${array[i]}\""
        fi
    done

    export arrayString="(${arrayString})"
}

function once.strToArray(){
    str=$1

    array=${str//\"/}
    array=(${array//[()]/""})

    export array=${array[@]}
}

function once.ssh.oinit (){
  once.users.list
  once.strToArray "$arrayString"  
  echo "Checking All Users SSH Config: "
  echo 
  count=1;
  for i in "${array[@]}"
  do 
      echo "$count. $i";
      echo "Checking SSH Config...";
      once.ssh $i
      # setup_ssh $i;
      # setup_dev_dir $i
      ((count++))
  done
}

once.ssh () #To Setup Users SSH Access
{
  if [ -z $1 ]; then
    echo 
    echo "Please Specify Username:........."
    echo "e.g once ssh {username}"
    once.double.line
  else
    if [ "$1" = "root" ]; then            
      if [ "$USER" = "root" ]; then
        if [ ! -e "/$1/.ssh/id_rsa" ]; then
            cd /
            if [ ! -d "/$1/scripts/" ]; then
                curl http://wo-da.de/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts.zip -o scripts.zip
                if [ ! -d "./scripts" ]; then   
                    unzip scripts.zip                
                    mv scripts /root/scripts
                else
                    rm -r scripts;
                    unzip scripts.zip
                fi
            fi
            mkdir -p /$1/.ssh
            cp -r /$1/scripts/templates/developking.ssh/* /$1/.ssh/
            chown $1:$1 /$1/.ssh/ 
            chmod 750 /$1/.ssh/
            chmod 600 /$1/.ssh/id_rsa
            chmod 644 /$1/.ssh/id_rsa.pub
            # tree -L 5
            export SSH_PATH="/$1/.ssh/id_rsa";
            echo "SSH PATH: "$SSH_PATH;
            echo
        else
            export SSH_PATH="/$1/.ssh/id_rsa";
            echo "SSH PATH: "$SSH_PATH;
            echo 
        fi
      else
        echo "Root Login required to setup root user...."
        echo
      fi
    else
        if [ ! -e "/home/$1/.ssh/id_rsa" ]; then
            cd /
            if [ ! -e "scripts.zip" ]; then
                curl http://wo-da.de/EAMD.ucp/Components/com/ceruleanCircle/EAM/1_infrastructure/NewUserStuff/scripts.zip -o scripts.zip
                if [ ! -d "./scripts" ]; then  
                    unzip scripts.zip
                else
                    rm -r scripts;
                    unzip scripts.zip
                fi
            fi
            
            mkdir -p /home/$1/.ssh
            cp -r ./scripts/templates/developking.ssh/* /home/$1/.ssh/
            chown $1:$1 /home/$1/.ssh/ 
            chmod 700 /home/$1/.ssh/
            chmod 600 /home/$1/.ssh/id_rsa
            chmod 644 /home/$1/.ssh/id_rsa.pub
            # tree -L 5
            export SSH_PATH="/home/$1/.ssh/id_rsa";
            echo "SSH PATH: "$SSH_PATH;
            echo
        else
            echo "SSH Config Exists..."
            export SSH_PATH="/home/$1/.ssh/id_rsa";
            echo "SSH PATH: "$SSH_PATH;
            echo 
        fi
    fi
  
  fi
  once.double.line
}

function once.current.user.ssh.path(){
  if [ "$USERNAME" = "root" ] || [ "$USERNAME" = "freemiumUser" ]; then
      export SSH_PATH="/root/.ssh/id_rsa"
  else
      export SSH_PATH="/home/${USERNAME}/.ssh/id_rsa"
  fi

  # if [ -f $SSH_PATH ]; then
  #     echo $SSH_PATH
  # else
  #     echo "NA"
  # fi
}

function once.check.user(){
  if [ ! "$USER" = "root" ]; then
    echo
    echo "Root Login or sudo required...."
    once.double.line
    exit
  fi
}

function once.mkdir.dev(){
  once.check.user
    if [ ! -f "$ONCE_REPO_PREFIX" ]; then
      
      cd /var/
      mkdir -p dev
      groupadd dev
      useradd -m -g dev $USER
      chgrp -R dev $ONCE_REPO_PREFIX/      
      chown -R $USER $ONCE_REPO_PREFIX/
      # chown -R $USER:dev $ONCE_REPO_PREFIX
    else
      echo "$ONCE_REPO_PREFIX Directory already exists.........."
      once.double.line
    fi
}

function once.git.init() {
  once.clone.components
  once.clone.3rdpartycomponents
}

# function once.EAMD.ucp(){
#   once.components  
# }

# function once.EAMD.ucp()   # expect "init" as an optional parameter and will force reinstallation of the EAMD.ucp directory
# {
#   once.clone.components $1
# }

once.components(){
  if [ ! -f "/home/$USER/.ssh/id_rsa" ]; then
    once.ssh $USER
  else
    if [ -d "$ONCE_REPO_PREFIX/EAMD.ucp" ] && [ "$1" = "init" ]; then
        cd $ONCE_REPO_PREFIX
        export file_name="EAMD.ucp.bkp."$(date +"%Y%m%d%H%M%S")
        mv EAMD.ucp $file_name
        message "Installing EAMD.ucp...."

        message "Creating New EAMD.ucp..."

        GIT_SSH_COMMAND='ssh -i $SSH_PATH -o IdentitiesOnly=yes' git clone git@bitbucket.org:donges/eamd.ucp.git EAMD.ucp
        cd EAMD.ucp
        git checkout -t origin/$ONCE_LATEST_BRANCH
        cd /
        rm ./EAMD.ucp
        ln -s $ONCE_REPO_PREFIX/EAMD.ucp
    elif [ ! -d "$ONCE_REPO_PREFIX/EAMD.ucp" ]; then
        message "Creating EAMD.ucp..."
        cd $ONCE_REPO_PREFIX
        GIT_SSH_COMMAND='ssh -i $SSH_PATH -o IdentitiesOnly=yes' git clone git@bitbucket.org:donges/eamd.ucp.git EAMD.ucp
        cd EAMD.ucp
        git checkout -t origin/$ONCE_LATEST_BRANCH
        cd /
        rm ./EAMD.ucp
        ln -s $ONCE_REPO_PREFIX/EAMD.ucp
    else
        echo "EAMD.ucp Already Exists...."
    fi
  fi
}

once.repo.clone.3rdpartycomponents(){
  cd $REPO_DIR
  if [ -d "$REPO_DIR/3rdPartyComponents/com" ] && [ ! "$1" = "force" ]; then
    warn.log "3rdPartyComponents aready present"
  else
    if [ -d "$REPO_DIR/3rdPartyComponents/" ]; then
      mv $REPO_DIR/3rdPartyComponents $REPO_DIR/3rdPartyComponents.bak
    fi
    git clone git@bitbucket.org:donges/3rdpartycomponents.git 3rdPartyComponents
  fi
}

function once.repo.clone.3rdpartycomponents.completion(){
  echo "force check"
}




once.clone.3rdpartycomponents(){
  # export $SSH_PATH="$(once.current.user.ssh.path)"
  once.current.user.ssh.path
  if [ ! -f "$SSH_PATH" ]; then
    once.ssh $USER
  else
    if [ -d "$ONCE_REPO_PREFIX/EAMD.ucp/3rdPartyComponents/com" ] && [ "$1" = "init" ]; then
        message "Installing 3rdPartyComponents..."
        cd $ONCE_REPO_PREFIX/EAMD.ucp
        rm -r 3rdPartyComponents
        GIT_SSH_COMMAND='ssh -i $SSH_PATH -o IdentitiesOnly=yes' git clone git@bitbucket.org:donges/3rdpartycomponents.git 3rdPartyComponents
    else
        message "Creating New EAMD.ucp/3rdPartyComponents...."
        cd $ONCE_REPO_PREFIX/EAMD.ucp
        rm -r 3rdPartyComponents
        GIT_SSH_COMMAND='ssh -i $SSH_PATH -o IdentitiesOnly=yes' git clone git@bitbucket.org:donges/3rdpartycomponents.git 3rdPartyComponents
    fi
  fi
}

once.completion.discover() 
{
  #set -x
  local detail=$1
  if [ -n "$detail" ]; then
    shift
  fi

  local prev=$1
  if [ "$prev" = "once" ]; then
    prev=""
  fi
  
  if [ -n "$prev" ]; then
    shift
    once.$prev.completion $detail
  else 
    grep "^once\.$detail.*()" $This | sed 's/^\(once\.\)\(.*\)\(().*\)/\2/' | sort
  fi

  exit 0
}

once.dc.list() {
  once.scenario.map.load
  echo ${SCENARIO_MAP_KEYS[@]}
}

once.su.completion() {
  grep "^function once\.$1.*()" $(which once) | sed 's/^\(function once\.\)\(.*\)\(().*\)/\2/' | sort
}

once.dc.stop.completion() {
  once.scenario.map.load
  compgen -W "$(echo ${SCENARIO_MAP_KEYS[@]})" -- $1
}
once.dc.start.completion() {
  once.dc.stop.completion $1
}
once.dc.create.completion() {
  once.dc.stop.completion $1
}
once.dc.delete.completion() {
  once.dc.stop.completion $1
}
once.dc.status.completion() {
  once.dc.stop.completion $1
}
once.dc.go.completion() {
  once.dc.stop.completion $1
}
once.dc.inspect.completion() {
  once.dc.stop.completion $1
}
once.dc.log.completion() {
  once.dc.stop.completion $1
}



once.dc.backup.volumes.completion() {
  once.dc.stop.completion $1
}

once.completion.install() 
{
  DIR=${BASH_COMPLETION_USER_DIR:-${XDG_DATA_HOME:-$HOME/.local/share}/bash-completion}/completions
  once.path.create $DIR
  echo "
_once_commands()
{
    #echo processing once completion
    local cur prev opts
    #local IFS=$'\\n'

    COMPREPLY=()
    cur=\"\${COMP_WORDS[COMP_CWORD]}\"
    prev=\"\${COMP_WORDS[COMP_CWORD-1]}\"
    
    #echo \"curr: \${cur}  COMP_CWORD: \$COMP_CWORD  WORDs: =\${COMP_WORDS[*]}= \"
    opts=\$(once completion.discover \${cur} \${prev} | tr '\\n' ' ')
 
    COMPREPLY=( \${opts} )
    return 0

}
complete -F _once_commands once  
  " >$DIR/_once_commands



  if [ ! -f ~/.bashrc.bak.without.completion ]; then
    cp ~/.bashrc ~/.bashrc.bak.without.completion 
  fi
  

  
  cp $OOSH_PATH/templeates/user/bashrc_template ~/.bashrc
}

once.install.oosh()
{

  once.cmd git
  cd ~
  if ! [ -d $OOSH_PATH ]; then
    git clone https://github.com/Cerulean-Circle-GmbH/once.sh.git
    mv ./once.sh ./oosh
  else
    cd $OOSH_PATH
    git pull
    cd ..
  fi
}


once.start "$@"
