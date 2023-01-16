#!/bin/bash

source $(dirname $0)/copy-paths.sh

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

  *"${archi_fiche_path}"*)
    archi_full_path="${root_path}${archi_fiche_path}"
    mapefluid_full_path="${root_path}${mapefluid_fiche_path}"
    relative_path="${param1/$archi_full_path}"
    final_path="${mapefluid_full_path}${relative_path}"
    echo "Pattern FICHE reconnu. On copie! ✅"
    cp $param1 $final_path
    ;;

  *"${archi_outil_path}"*)
    archi_full_path="${root_path}${archi_outil_path}"
    mapefluid_full_path="${root_path}${mapefluid_outil_path}"
    relative_path="${param1/$archi_full_path}"
    final_path="${mapefluid_full_path}${relative_path}"
    echo "Pattern OUTIL reconnu. On copie! ✅"
    cp $param1 $final_path
    ;;

  *"${archi_page_path}"*)
    archi_full_path="${root_path}${archi_page_path}"
    mapefluid_full_path="${root_path}${mapefluid_page_path}"
    relative_path="${param1/$archi_full_path}"
    final_path="${mapefluid_full_path}${relative_path}"
    echo "Pattern PAGE reconnu. On copie! ✅"
    cp $param1 $final_path
    ;;

  *)
    echo "Pattern non reconnu. On ne copie pas! ❌"
    ;;
esac