#! /bin/bash
[ $# != 1 ] && echo "usage: $(basename $0) <authorized_keys>" 1>&2 && exit 1
F=$1
rm -f users.txt
echo "finding unique users in $F:"
while IFS='' read -r line || [[ -n "$line" ]]; do
   D=($line)
   user="${D[2]}"
   user=${user%@*}
   echo "${user}"
done < "$F" | sort | uniq | tee  users.txt

[ $(grep -c '^\<data\>' /etc/group) -ge 1 ] || groupadd data
while IFS='' read -r user; do
   [ -d /home/${user} ] && echo "${user}: already exists" && continue
   useradd --groups data --create-home ${user} || continue
   mkdir -p /home/${user}/.ssh || continue
   grep ${user} $F > /home/${user}/.ssh/authorized_keys || continue
   chmod -R go-rw /home/${user}/.ssh || continue
   chown -R ${user}:${user} /home/${user}/.ssh
   echo "${user}: created"
done < users.txt
rm -f users.txt
