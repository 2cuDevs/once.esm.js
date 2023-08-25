#!/bin/bash

test.once.v()
{
  echo "test: ${FUNCNAME[0]}($1)"
  echo "test found"
  once v
}


test.once.parameter()
{
  echo "test: ${FUNCNAME[0]}($1)"
  echo "test found"
  once 1 a b c 2 d e 3 f g
  once 3 f g 1 a b c 2 d e
}

test.once.installed()
{
  echo "test: ${FUNCNAME[0]}($1)"
  echo "test found"
}

