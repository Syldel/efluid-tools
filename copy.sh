#!/bin/bash

root_path="/Users/sylvain/workspace/*********"

# COMPOSANTS
archi_composants_path="/archi/javascript/projets/*********"
mapefluid_composants_path="/*********/*********/frontend/node_modules/*********"

# CORE
archi_core_path="/archi/javascript/projets/*********"
mapefluid_core_path="/*********/*********/frontend/node_modules/*********"

param1=$1

case $param1 in
  *"${archi_composants_path}"*)
    archi_full_path="${root_path}${archi_composants_path}"
    mapefluid_full_path="${root_path}${mapefluid_composants_path}"
    relative_path="${param1/$archi_full_path}"
    final_path="${mapefluid_full_path}${relative_path}"
    echo "Pattern COMPOSANT reconnu. On copie! ✅"
    cp $param1 $final_path
    ;;

  *"${archi_core_path}"*)
    archi_full_path="${root_path}${archi_core_path}"
    mapefluid_full_path="${root_path}${mapefluid_core_path}"
    relative_path="${param1/$archi_full_path}"
    final_path="${mapefluid_full_path}${relative_path}"
    echo "Pattern CORE reconnu. On copie! ✅"
    cp $param1 $final_path
    ;;

  *)
    echo "Pattern non reconnu. On ne copie pas! ❌"
    ;;
esac