while true; do
  cat sample.txt | while read x; do
    echo $x | sh
    sleep 10
  done
  echo
done